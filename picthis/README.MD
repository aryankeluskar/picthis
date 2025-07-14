<div align="center">
<img src="https://github.com/aryankeluskar/picthis/blob/master/picthis/assets/PicThis.png?raw=true" alt="PicThis Banner" />
</div>

<h2 align="center">CLI tool that converts images to WebP format and auto-updates all references for better web performance.</h2>

<p align="center">
<a href="https://www.npmjs.com/package/picthis">
<img alt="npm version" src="https://img.shields.io/npm/v/picthis.svg?style=flat-square"></a>
<a href="https://www.npmjs.com/package/picthis">
<img alt="weekly downloads from npm" src="https://img.shields.io/npm/dw/picthis.svg?style=flat-square"></a>
<a href="https://x.com/intent/follow?screen_name=aryankeluscar">
<img alt="Follow Aryan on X" src="https://img.shields.io/badge/%40aryankeluscar-9f9f9f?style=flat-square&logo=x&labelColor=555"></a>
</p>

## Installation

```bash
npm install -g picthis
```

## Usage

```bash
npx picthis [directory] [options]
```

Converts images to WebP format and automatically updates file references in your codebase.

| Flag | Description |
|------|-------------|
| `-w, --write` | Actually perform the conversion (default: preview mode) |
| `-r, --replace` | Replace original files instead of keeping them |

**Examples:**
```bash
picthis                    # Preview conversion in current directory
picthis --write            # Convert images in current directory  
picthis ./assets --write   # Convert images in assets folder
picthis --write --replace  # Convert and remove original files
```
