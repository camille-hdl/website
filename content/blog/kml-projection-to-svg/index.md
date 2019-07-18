---
title: Convert KML Placemarks to SVG Polygons
date: "2017-04-11T20:00:00.000Z"
---

Being easily confused by basic geometry, I tend to stick to 2D whevener possible.  

Unfortunately, ([in France at least](https://www.data.gouv.fr/en/datasets/geofla-r/)) publicly available data on administrative divisions often comes in various geographic coordinates systems which,
while convenient if you need to georeference something, make everything complicated when you just want to display
a nice SVG map.

I [hacked together a handy JavaScript tool](https://github.com/camille-hdl/kml-polygon-to-svg) to aleviate some of the pain involved for a product I was building.  

If we abstract I/O, the whole process can be summarized to two steps: __projection__ and __simplification__.

## 1. Projection

In order to convert KML placemark "polygons" to actual SVG Polygons, one must convert each points of said polygons.  
Converting points __from 3D space__, such as a geographical coordinates system, __to a 2D plane__ is called a __*projection*__.  
*Of course*, there are [many different projections](https://en.wikipedia.org/wiki/Map_projection) and *of course*, if you listen to the internet, ALL of them are terrible for one reason or another.  

For my experimentations though, I picked [equirectangular](https://en.wikipedia.org/wiki/Equirectangular_projection) and [mercator](https://en.wikipedia.org/wiki/Web_Mercator_projection).  
The implementations can be found [here](https://github.com/camille-hdl/kml-polygon-to-svg/blob/master/src/projections.js).


## 2. Simplification

We have our polygons properly flattened, but we can't yet ship them to our users.  
As the source KML files are too precise for our needs, so are our KML files.  

Fortunately, the field of geometry is full of interesting algorithms ready to solve our problems, so picking a simplification algorithm
was as easy as 2 google searches:  

* one for the algorithm itself: [Ramer-Douglas-Peucker](https://www.wikiwand.com/en/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm)
* one for the [implementation](https://gist.github.com/adammiller/826148)

