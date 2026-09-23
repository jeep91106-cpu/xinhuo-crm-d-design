import test from 'node:test';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';

for(const entry of ['core-render.test.jsx','operations-render.test.jsx']){
  test(entry+' renders modules and field contracts without a browser',async()=>{
    const result=await build({entryPoints:[fileURLToPath(new URL('../src/'+entry,import.meta.url))],bundle:true,write:false,format:'cjs',platform:'node',loader:{'.css':'empty'},external:['react','react-dom','react-dom/server']});
    const loaded={exports:{}};
    new Function('require','module','exports',result.outputFiles[0].text)(createRequire(import.meta.url),loaded,loaded.exports);
  });
}
