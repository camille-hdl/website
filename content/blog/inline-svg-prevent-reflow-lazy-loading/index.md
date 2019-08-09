---
title: Inline svg to prevent reflow when lazy-loading images
date: "2019-08-09T21:00:00.000Z"
description: "Prevent unwanted reflows when lazy-loading images by inlining svgs of the same ratio."
---

## The problem

*Lazy-loading* generally means fetching a resource only if and when it's needed, in order to improve (at least perceived) performance.  
To lazy-load images, one would wait for an `<img />` element to be about to enter the viewport to load it.  

*Reflow* is what happens when the browser needs to redraw the viewport in reaction to an update of the DOM.  
For instance, since the browser cannot know the *intrinsic* width or height of the image before loading it, it will most likely cause a reflow once it has loaded it, causing the surrouding content to jump around.

## The solution

While [css-based tricks](https://www.voorhoede.nl/nl/blog/say-no-to-image-reflow/) exist that can address this issue, it can get messy if it conflicts with your styling.  
Another way of dealing with it is to provide a placeholder image with the same aspect ratio as your original image.  
__This assumes, of course, that you have access to said ratio *before* loading the actual image__.

An easy way to do this is to set the `src` attribute to an inline svg image.  

```html
<img src='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"%3E%3C/svg%3E' />
```

All that matters is that __the `viewBox` of the svg must have the same *aspect ratio* as your actual image__.  

Here is an example in React :

<iframe src="https://codesandbox.io/embed/strange-mclean-mzc5e?fontsize=14" title="Inline SVG for lazy-loading images" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
