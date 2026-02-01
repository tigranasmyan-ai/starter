import pkg from "gulp";
import gulpSass from 'gulp-sass';
import dartSass from "sass";
import browserSync from "browser-sync";
import twig from 'gulp-twig';
import gcmq from 'gulp-group-css-media-queries';
import shorthand from 'gulp-shorthand';
import autoprefixer from "gulp-autoprefixer";
import sourceMaps from "gulp-sourcemaps";
import csso from 'gulp-csso';
import rename from 'gulp-rename';
import uglify from 'gulp-uglify';
import clean from 'gulp-clean';

const {series, task, src, dest, watch, parallel} = pkg;
const sass = gulpSass(dartSass);
browserSync.create();

/** Пути */
const config = {
	sass: {
		folder: './src/scss/',
		chunks: './src/scss/*.scss',
		vendors: './src/scss/vendors/*.scss',
		dest: './dest/css/',
	},
	html: {
		dest: './dest/',
		pages: './src/twig/*.twig',
		folder: './src/twig/'
	},
	js: {
		main: './src/js/main.js',
		dest: './dest/js/',
		vendors: './src/js/vendors/*.js',
	},
	fonts: {
		folder: './src/fonts/**/*',
		dest: './dest/fonts',
	},
	images: {
		folder: './src/img/**/*',
		dest: './dest/img/',
	},
	dest: {
		folder: './dest',
	},
};

/**
 * Стили
 */
// Стили для разработки
task('styles:dev', () => src(config.sass.chunks)
	.pipe(sass())
	.pipe(browserSync.reload({stream: true}))
	.pipe(dest(config.sass.dest))
);

// Плагины для разработки
task('style:vendors:dev', () => src(config.sass.vendors)
	.pipe(sass())
	.pipe(browserSync.reload({stream: true}))
	.pipe(dest(config.sass.dest))
);

// Стили для стенда
task('styles:prod', () => src(config.sass.chunks)
	.pipe(sourceMaps.init())
	.pipe(sass())
	.pipe(shorthand())
	.pipe(gcmq())
	.pipe(autoprefixer('last 2 versions'))
	.pipe(dest(config.sass.dest))
	.pipe(csso())
	.pipe(rename({suffix: '.min'}))
	.pipe(sourceMaps.write('./'))
	.pipe(dest(config.sass.dest))
);

// Плагины для стенда
task('style:vendors:prod', () => src(config.sass.vendors)
	.pipe(sourceMaps.init())
	.pipe(sass())
	.pipe(shorthand())
	.pipe(gcmq())
	.pipe(autoprefixer('last 2 versions'))
	.pipe(dest(config.sass.dest))
	.pipe(csso())
	.pipe(rename({suffix: '.min'}))
	.pipe(sourceMaps.write('./'))
	.pipe(dest(config.sass.dest))
);

// Наблюдатель для стилей
task('styles:watcher', () =>
	watch([config.sass.folder + '**/*.scss', `!${config.sass.vendors}`], series('styles:dev'))
);

// Наблюдатель для плагинов
task('styles:vendors:watcher', () =>
	watch(config.sass.vendors, series('style:vendors:dev'))
);

/**
 * Скрипты
 */
// Скрипт для разработки
task('js:dev', () => src(config.js.main)
	.pipe(browserSync.reload({stream: true}))
	.pipe(dest(config.js.dest))
);

// Плагины для разработки
task('js:vendors:dev', () => src(config.js.vendors)
	.pipe(browserSync.reload({stream: true}))
	.pipe(dest(config.js.dest))
);

// Скрипт для стенда
task('js:prod', () => src(config.js.main)
	.pipe(sourceMaps.init())
	.pipe(dest(config.js.dest))
	.pipe(uglify())
	.pipe(rename({suffix: '.min'}))
	.pipe(sourceMaps.write('./'))
	.pipe(dest(config.js.dest))
);

// Плагины для стенда
task('js:vendors:prod', () => src(config.js.vendors)
	.pipe(dest(config.js.dest))
	.pipe(uglify())
	.pipe(rename({suffix: '.min'}))
	.pipe(sourceMaps.write('./'))
	.pipe(dest(config.js.dest))
);

// Наблюдатель скриптов
task('js:watcher', () =>
	watch(config.js.main, series('js:dev'))
);

// Наблюдатель плагинов
task('js:vendors:watcher', () =>
	watch(config.js.main, series('js:vendors:dev'))
);

/**
 * Сервер
 */
task("server", () => {
	browserSync.init({
		port: 5050,
		server: {
			baseDir: "./dest",
		},
		notify: false,
	});
});

/**
 * HTML
 */
// HTML
task('html', () => src(config.html.pages)
	.pipe(twig())
	.pipe(browserSync.reload({stream: true}))
	.pipe(dest(config.html.dest))
);

// Наблюдатель HTML
task('html:watcher', () => watch(config.html.folder, series('html')));

/**
 * Шрифты
 */
task('fonts', () => src(config.fonts.folder)
	.pipe(dest(config.fonts.dest))
);
task('fonts:watcher', () => watch(config.fonts.folder, series('fonts')));

/**
 * Картинки
 */
task('images', () => src(config.images.folder)
	.pipe(dest(config.images.dest))
);
task('images:watcher', () => watch(config.images.folder, series('images')));

/**
 * Удаление папки дев
 */
task('delete:dest', () => src(config.dest.folder, {read: false, allowEmpty: true}).pipe(clean()));

/** Разработка */
task('default', series(
	'delete:dest',
	parallel(
		'styles:dev',
		'html',
		'js:dev',
		'js:vendors:dev',
		'fonts',
		'images',
	),
	parallel(
		'server',
		'styles:watcher',
		'styles:vendors:watcher',
		'html:watcher',
		'js:watcher',
		'js:vendors:watcher',
		'fonts:watcher',
		'images:watcher',
	),
));

/** Прод */
task('prod', series(
	'delete:dest',
	'styles:prod',
	'html',
	'style:vendors:prod',
	'js:prod',
	'js:vendors:prod',
	'fonts',
	'images',
));
