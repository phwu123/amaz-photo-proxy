const express = require('express');
const parser = require('body-parser');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan')
const axios = require('axios')

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.options('*', cors());
app.use(parser.json());
app.use(parser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, '/client')));

const port = 3000;

const clientBundles = './client/services';
const serverBundles = './templates/services';
const serviceConfig = require('./service-config.json');
const services = require('./loader.js')(clientBundles, serverBundles, serviceConfig);
const React = require('react');
const ReactDom = require('react-dom/server');
const Layout = require('./templates/layout');
const App = require('./templates/app');
const Scripts = require('./templates/scripts');

const renderComponents = (components, props = {}) => {
  return Object.keys(components).map(item => {
    let component = React.createElement(components[item], props);
    return ReactDom.renderToString(component);
  });
};

app.get('/', (req, res) => {
  let components = renderComponents(services);
  //let props = req.params.id;
  res.end(Layout(
    'Photo Gallery',
    App(...components),
    Scripts(Object.keys(services))
  ));
});


app.get('/id/:id', (req, res) => {
  console.log('aa ', req.params.id)
  axios('http://18.191.138.148/api/id/' + req.params.id)
    .then(cats => {
      res.send(cats.data);
    })
    .catch(err => {
      res.send('err in prox ', err)

    })
})


app.listen(port, (err)=> {
  err ? console.log('error connecting to server', err) : console.log('connected to server on port '+ port)
})
