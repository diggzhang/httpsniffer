# httpSniffer

## Usage

```

$ npm install --save httpsniffer 

const sniffer = require('httpsniffer')

// api - backend http log api address
// blackurl - default route.all('/') api address
// apptag - app name

app.use(sniffer.logSniffer({"api":"http://localhost:4600/api/v3_5/httplog", blackurl: "http://localhost:3000/", apptag:"onionsBackend"}))
app.use(router.routes())


```
