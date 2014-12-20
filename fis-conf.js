var meta = require('./package.json');
fis.config.set('name', meta.name);
fis.config.set('version', meta.version);
//fis.project.setProjectRoot(meta.root || __dirname + '/src');

fis.config.set('framework.urlPattern', '/' + meta.name + '/' + meta.version + '/lib/%s');
//TODO: comboPattern