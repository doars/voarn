import build from '../.scripts/esbuild.js'

const files = [{
  from: 'src/libraries/hyperapp.ts',
  to: 'dst/hyperapp.js',
}, {
  from: 'src/libraries/mithril.ts',
  to: 'dst/mithril.js',
}, {
  from: 'src/libraries/redom.ts',
  to: 'dst/redom.js',
}, {
  from: 'src/libraries/snabbdom.ts',
  to: 'dst/snabbdom.js',
}, {
  from: 'src/libraries/staark-patch.ts',
  to: 'dst/staark-patch.js',
}, {
  from: 'src/libraries/staark.ts',
  to: 'dst/staark.js',
}, {
  from: 'src/libraries/superfine.ts',
  to: 'dst/superfine.js',
}]

for (const file of files) {
  await build(file)
}
