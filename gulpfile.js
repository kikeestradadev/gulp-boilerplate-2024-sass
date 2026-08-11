import gulp from 'gulp';
import plumber from 'gulp-plumber';
import pug from 'gulp-pug';
import postcss from 'postcss';
import data from 'gulp-data';
import fs from 'fs';
import path from 'path';
import http from 'node:http';
import { Transform } from 'node:stream';
import { exec } from 'node:child_process';
import * as esbuild from 'esbuild';
import { minify as minifyHtml } from 'html-minifier-next';
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

const isProd = process.env.NODE_ENV === 'production';
const DEV_PORT = 3000;
const PUBLIC_DIR = path.resolve('public');
const PAGES_GLOB = './src/pug/pages/**/*.pug';

const mimeTypes = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.js': 'application/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.map': 'application/json; charset=utf-8',
	'.ico': 'image/x-icon',
};

const liveClients = new Set();
let pugSources = PAGES_GLOB;

const LIVE_RELOAD_SNIPPET = `
<script>
(() => {
	const source = new EventSource('/__livereload');
	source.onmessage = (event) => {
		const payload = event.data || 'reload';
		const [type, targetPath] = payload.split(':');

		// Only the focused tab reacts — background tabs stay idle.
		if (document.visibilityState !== 'visible') {
			return;
		}

		if (type === 'css') {
			document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
				const url = new URL(link.href);
				url.searchParams.set('t', Date.now());
				link.href = url.toString();
			});
			return;
		}

		if (type === 'reload' && targetPath && targetPath !== '*') {
			const current = location.pathname.replace(/\\/$/, '') || '/index.html';
			const normalizedCurrent = current.endsWith('.html')
				? current
				: current === '' || current === '/'
					? '/index.html'
					: current + '.html';
			const normalizedTarget = targetPath.startsWith('/')
				? targetPath
				: '/' + targetPath;

			if (normalizedCurrent !== normalizedTarget) {
				return;
			}
		}

		location.reload();
	};
})();
</script>
`;

const notifyClients = (type = 'reload') => {
	for (const client of liveClients) {
		client.write(`data: ${type}\n\n`);
	}
};

const debounce = (fn, wait = 150) => {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => fn(...args), wait);
	};
};

const openBrowser = (url) => {
	if (process.env.OPEN === 'false') {
		return;
	}

	const platform = process.platform;
	const command =
		platform === 'darwin'
			? `open "${url}"`
			: platform === 'win32'
				? `start "" "${url}"`
				: `xdg-open "${url}"`;

	exec(command, () => {});
};

const startDevServer = () => {
	const server = http.createServer((req, res) => {
		const requestUrl = new URL(req.url || '/', `http://${req.headers.host}`);

		if (requestUrl.pathname === '/__livereload') {
			res.writeHead(200, {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive',
			});
			res.write('\n');
			liveClients.add(res);
			req.on('close', () => {
				liveClients.delete(res);
			});
			return;
		}

		let pathname = decodeURIComponent(requestUrl.pathname);
		if (pathname.endsWith('/')) {
			pathname += 'index.html';
		}

		const filePath = path.normalize(path.join(PUBLIC_DIR, pathname));
		if (!filePath.startsWith(PUBLIC_DIR)) {
			res.writeHead(403).end('Forbidden');
			return;
		}

		fs.readFile(filePath, (error, fileData) => {
			if (error) {
				res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
				res.end('Not found');
				return;
			}

			const ext = path.extname(filePath).toLowerCase();
			const contentType = mimeTypes[ext] || 'application/octet-stream';
			res.writeHead(200, { 'Content-Type': contentType });

			if (ext === '.html') {
				const html = fileData.toString('utf8');
				const injected = html.includes('</body>')
					? html.replace('</body>', `${LIVE_RELOAD_SNIPPET}</body>`)
					: `${html}${LIVE_RELOAD_SNIPPET}`;
				res.end(injected);
				return;
			}

			res.end(fileData);
		});
	});

	server.listen(DEV_PORT, () => {
		const url = `http://localhost:${DEV_PORT}`;
		console.log(`[dev] ${url}`);
		openBrowser(url);
	});

	return server;
};

const getJsonData = () => {
	const dataDir = './src/data/';
	const files = fs.readdirSync(dataDir);
	const jsonData = {};

	const kebabToCamel = (value) =>
		value.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());

	files.forEach((file) => {
		if (path.extname(file) !== '.json') {
			return;
		}

		const parsed = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
		const base = path.basename(file, '.json');

		// main-slider-data.json → local mainSliderData (object root of the file)
		if (base.endsWith('-data')) {
			jsonData[kebabToCamel(base)] = parsed;
			return;
		}

		// Legacy multi-key files (example.json, slider.json, …)
		Object.assign(jsonData, parsed);
	});

	return jsonData;
};

/** Cache-bust query for local CSS/JS; bumped by scripts/bump-assets.mjs on build. */
const getAssetVersion = () => {
	try {
		const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
		return pkg.assetVersion || '1.0.0';
	} catch {
		return '1.0.0';
	}
};

const pugLocals = () => ({
	...getJsonData(),
	assetVersion: getAssetVersion(),
});

const pagePathFromFile = (filePath) => {
	const relative = path.relative('src/pug/pages', filePath).replace(/\\/g, '/');
	if (!relative || relative.startsWith('..') || !relative.endsWith('.pug')) {
		return null;
	}
	return '/' + relative.replace(/\.pug$/, '.html');
};

const reload = (done) => {
	notifyClients('reload:*');
	done();
};

const reloadCss = (done) => {
	notifyClients('css');
	done();
};

const reloadPage = (pagePath) => (done) => {
	notifyClients(pagePath ? `reload:${pagePath}` : 'reload:*');
	done();
};

const mapHtml = (transformFn) =>
	new Transform({
		objectMode: true,
		async transform(file, _enc, cb) {
			try {
				if (file.isBuffer()) {
					const input = file.contents.toString('utf8');
					const output = await transformFn(input);
					file.contents = Buffer.from(output);
				}
				cb(null, file);
			} catch (error) {
				cb(error);
			}
		},
	});

const htmlMinify = () =>
	mapHtml((html) => {
		if (!isProd) {
			return html;
		}

		return minifyHtml(html, {
			collapseWhitespace: true,
			removeComments: true,
			minifyCSS: true,
			minifyJS: true,
		});
	});

const compilePug = () => {
	return gulp
		.src(pugSources, { allowEmpty: true, base: './src/pug/pages' })
		.pipe(plumber())
		.pipe(data(pugLocals))
		.pipe(
			pug({
				pretty: !isProd,
				compileDebug: false,
				doctype: 'html',
			})
		)
		.pipe(htmlMinify())
		.pipe(gulp.dest('public'));
};

gulp.task('pug', () => {
	pugSources = PAGES_GLOB;
	return compilePug();
});

gulp.task('styles', async () => {
	const inputPath = 'src/styles/styles.css';
	const outputPath = 'public/styles.css';
	const plugins = [tailwindcss, autoprefixer()];

	if (isProd) {
		// Strip every comment in public CSS (licenses included). Author notes live only in src/.
		plugins.push(
			cssnano({
				preset: [
					'default',
					{
						discardComments: { removeAll: true },
					},
				],
			})
		);
	}

	const css = fs.readFileSync(inputPath, 'utf8');
	const result = await postcss(plugins).process(css, {
		from: inputPath,
		to: outputPath,
		map: isProd ? false : { inline: false },
	});

	fs.mkdirSync('public', { recursive: true });
	fs.writeFileSync(outputPath, result.css);

	if (result.map) {
		fs.writeFileSync(`${outputPath}.map`, result.map.toString());
	} else {
		try {
			fs.unlinkSync(`${outputPath}.map`);
		} catch {
			// ignore missing maps
		}
	}
});

gulp.task('scripts', async () => {
	await esbuild.build({
		entryPoints: ['src/js/index.js'],
		bundle: true,
		outfile: 'public/index.js',
		format: 'iife',
		target: ['es2018'],
		minify: isProd,
		// Dev keeps code readable; prod drops all comments (including /*! and // license banners).
		legalComments: isProd ? 'none' : 'inline',
		sourcemap: !isProd,
		logLevel: 'silent',
	});
});

gulp.task(
	'assets',
	gulp.parallel(
		() =>
			gulp
				.src('src/assets/**/*', { encoding: false, allowEmpty: true })
				.pipe(gulp.dest('public/assets')),
		() =>
			gulp
				.src('src/images/**/*', { encoding: false, allowEmpty: true })
				.pipe(gulp.dest('public/images'))
	)
);

gulp.task('clean-maps', (done) => {
	if (!isProd) {
		done();
		return;
	}

	['public/index.js.map', 'public/styles.css.map'].forEach((file) => {
		try {
			fs.unlinkSync(file);
		} catch {
			// ignore missing maps
		}
	});
	done();
});

gulp.task(
	'serve',
	gulp.series('pug', 'styles', 'scripts', 'assets', (done) => {
		startDevServer();

		const onPageChange = debounce((filePath) => {
			const pagePath = pagePathFromFile(filePath);
			pugSources = filePath;
			gulp.series(compilePug, 'styles', reloadPage(pagePath))();
		}, 120);

		const onSharedPugChange = debounce(() => {
			pugSources = PAGES_GLOB;
			gulp.series('pug', 'styles', reload)();
		}, 120);

		gulp.watch('src/pug/pages/**/*.pug').on('change', onPageChange);
		gulp.watch(['src/pug/components/**/*.pug', 'src/pug/config/**/*.pug'], onSharedPugChange);
		gulp.watch(
			['src/styles/styles.css', 'tailwind.config.js'],
			debounce(gulp.series('styles', reloadCss), 120)
		);
		gulp.watch('src/js/**/*.js', debounce(gulp.series('scripts', reload), 120));
		gulp.watch(
			['src/data/**/*.json', 'src/md/**/*.md'],
			debounce(gulp.series('pug', 'styles', reload), 120)
		);
		gulp.watch(
			['src/assets/**/*', 'src/images/**/*'],
			debounce(gulp.series('assets', reload), 120)
		);

		done();
	})
);

gulp.task('dev', gulp.series('serve'));
gulp.task('build', gulp.series('pug', 'styles', 'scripts', 'assets', 'clean-maps'));
gulp.task('default', gulp.series('dev'));
