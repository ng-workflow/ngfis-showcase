var meta = require('./package.json');
fis.config.set('name', meta.name);
fis.config.set('version', meta.version);
fis.config.set('framework.cache', false);