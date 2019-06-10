const fs = require('fs');
const path = require('path');
const Meow = require('meow');
const Listr = require('listr');
const Execa = require('execa');
const Chalk = require('chalk');

/**
 * Get Component names from cli input
 * scan and verify files & folders (components, package.json, Component file)
 * create index.js file
 * change package.json
 * run bundler
 * propt to publish
 */

tasks = [{
        title: 'Checking Files ...',
        task: () => {

        }
    },
    {
        title: 'Creating index.js ...',
        task: () => {

        }
    },
    {
        title: 'Making Changes to package.json ...',
        task: () => {

        }
    },
    {
        title: 'Running Bundler ...',
        task: () => {

        }
    },
    {
        title: 'Log In to NPM ...',
        task: () => {

        }
    },
    {
        title: 'Publish to NPM ...',
        task: () => {

        }
    }
];

const cli = Meow(`
    Warnings
        put all components in to components folder.

    Options
        --name, -n Change name of Package.
`, {
    flags: {
        name: {
            type: 'string',
            alias: 'n'
        }
    }
});




module.exports.checkFile = function (filename, isComponent) {
    // FUTURE inc src?
    let checker = isComponent ? 
        fs.existsSync('./' + filename) : 
        fs.existsSync('./component' + filename);
    if(checker){
        return true;
    }else{
        return false;
    }
}

module.exports.changePkg = function () {

}

module.exports.createIndex = function(components) {
    let compNames = components.join(', ');

    let content = `import Vue from "vue";\n`;

    components.forEach(c => {
        content += `import ${c} from "./${c}.vue";\n`;
    });

    content += `const Components = {${compNames}};\n`;
    content += `Object.keys(Components).forEach(name => \n\t{Vue.component(name, Components[name]);\n});\nexport default Components;`;

    fs.writeFileSync('./components/index.js', content);
}

module.exports.startBundle = function () {
    Execa.stdout('npm', ['run', 'bundler']);
}