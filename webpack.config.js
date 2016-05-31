const webpack 	= require('webpack');
const fs      	= require('fs');
const path    	= require('path'),
      join    	= path.join,
      resolve 	= path.resolve;
const root 	  	= resolve(__dirname);
const src		= join(root, 'src');
const modules	= join(root, 'node_modules');
const dest		= join(root, 'dist');

const NODE_ENV = process.env.NODE_ENV;
const dotenv = require('dotenv');
const isDev = NODE_ENV === 'development';

const cssModulesNames = `${isDev ? '[path][name]__[local]__' : ''}[hash:base64:5]`;
const matchCssLoaders = /(^|!)(css-loader)($|!)/;

const findLoader = (loaders, match) => {
	const found = loaders.filter(l => l && l.loader && l.loader.match(match));
	return found ? found[0] : null;
}

const getConfig = require('hjs-webpack');

var config = getConfig({
	isDev: isDev,
	in: join(src, 'app.js'),
	out: dest,
	clearBeforeBuild: true
})

config.postcss = [].concat([
	require('precss')({}),
	require('autoprefixer')({}),
	require('cssnano')({})
]);

// existing css loader
const cssloader = findLoader(config.module.loaders, matchCssLoaders);

// for the main css
const newloader = Object.assign({}, cssloader, {
	test: /\.module\.css$/,
	include: [src],
	loader: cssloader.loader
		.replace(matchCssLoaders,
		`$1$2?modules&localIdentName=${cssModulesNames}$3`)
})
config.module.loaders.push(newloader);
cssloader.test = new RegExp(`[^module]${cssloader.test.source}`);
cssloader.loader = newloader.loader;

// for loading other css files, like font awesome
config.module.loaders.push({
	test: /\.css$/,
	include: [modules],
	loader: 'style!css'
});

const dotEnvVars = dotenv.config();
const environmentEnv = dotenv.config({
	path: join(root, 'config', `${NODE_ENV}.config.js`),
	silent: true
});
const envVariables = Object.assign({}, dotEnvVars, environmentEnv);

module.exports = config;
