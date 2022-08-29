---
title: Senior / Lead Full Stack Developer, JavaScript & PHP
date: "2022-08-29T10:55:00.000Z"
description: Resume
lang: en
---
[Français](/cv/) - camilleh@hey.com

## Languages & Technologies
<table class="resume-table">
    <tbody>
        <tr>
            <th scope="row">Languages:</th>
            <td>PHP, JavaScript, SQL, Bash</td>
        </tr>
        <tr>
            <th scope="row">Frameworks:</th>
            <td>Symfony, React</td>
        </tr>
        <tr>
            <th scope="row">Databases:</th>
            <td>MySQL, Elasticsearch</td>
        </tr>
        <tr>
            <th scope="row">Testing:</th>
            <td>PHPUnit, Jest, Cypress</td>
        </tr>
        <tr>
            <th scope="row">Other:</th>
            <td>Docker, Linux, Type systems, RStudio, Plesk</td>
        </tr>
    </tbody>
</table>	

## Work experiences

<h3 class="resume-heading">
    <span>Lead full stack developer, 1egal2, Remote</span>
    <span>2016 - 2021</span>
</h3>

* Lead the complete rewrite of [Arkothèque CMS](https://arkotheque.fr) to successfull completion with a team of 1 to 4 developers over the course of the project, 1 webdesigner and 1 domain expert. A monolith using PHP 8, Symfony, React.js, MySQL and ElasticSearch. Used on websites such as [Archives de l'Allier](https://archives.allier.fr) or [Archives du cher](https://archives18.fr/). Our infrastructure handles 10,000s of search requests and 100,000s of HD image processing requests per day, across ~30 websites using Arkothèque.
* As lead, I designed the architecture of the core systems, supported developer tooling and documentation
* As an individual contributor, I own 60% of the surviving code
* Changed deployment procedures from manual steps performed only by technical people to a completely automated process using bash scripts and CI tools, triggered from a UI by anyone on the team, achieving up to 15 deployments per day on multiple websites with near-zero deployment incidents in the last year
* Changed the deployment requirements from LAMP on dedicated servers to Plesk on VPS, docker-compose or self-hosting by clients
* Set up continuous integration and tests parallelization on Bitbucket Pipelines
* Introduced code review, pair programming, blameless postmortems and usage of an internal knowledge base to the team
* Instituted unit, integration and end-to-end testing using PHPUnit, Jest and Cypress
* Set up monitoring and observability using ELK
* Initiated Kanban for project management and software work, making work visible
* Monitored and optimized performance, dividing average critical path load time by 2 while queries multiplied by 10 in the last year
* Lead the GDPR compliance effort
* Created internal tooling to help the team monitor, operate and perform ETL into the application, using bash scripts and other CLI tools
* Created [Cuisine EAD](https://cuisine-ead.netlify.app), an open-source tool for XML/EAD processing, at first as a side project but worked on it professionally as it is used by unknown users but also clients and colleagues. This is a static Progressive Web App using React.js and Web Workers, CI on Travis and continuously deployed on Netlify.
* Aggregated and analyzed metrics from different tools, from code repositories to time trackers and kanban boards, using R and RStudio
* Ran meetings with clients and third parties about integrations with other systems or project kick-offs
* Ran interviews with users for feature design or re-design
* Front-end development and dataviz using React, Mapbox and paper.js (for which I wrote [an animation library](https://github.com/camille-hdl/animatePaper.js)) for [Oscars Santé](https://www.oscarsante.org/)
* System design and individual contributions on Arkothèque Gestion

<h3 class="resume-heading">
    <span>Font-end developer, 1egal2, Marseille</span>
    <span>2012 - 2016</span>
</h3>

* Maintained and developed new features on older versions of Arkothèque CMS, then a PHP 4, Flash, JavaScript & MySQL application. This software is still used by thousands of visitors daily on a few websites, such as [Mémoire des Hommes](https://www.memoiredeshommes.sga.defense.gouv.fr/). Deployed on dedicated servers.
* Rewrote core features from Flash to HTML5 + JavaScript & jQuery, such as [the image viewer](https://www.memoiredeshommes.sga.defense.gouv.fr/fr/ark:/40699/m00523ac7d3d2856/5242c6eab9ed9)
* Worked on the front-end of [Archiphone](https://www.1egal2.com/a/525/archiphone/), a multi-media project using ffmpeg, JavaScript, PHP & MySQL
* Introduced the team of 4 (1 graphic designer, 1 project manager and 1 other developer) to version control and git


<h3 class="resume-heading">
    <span>Junior developer, Global Product Service, Trets</span>
    <span>2011 - 2012</span>
</h3>

* Integrated APIs with marketplace webservices (pixmania, amazon...) and internal user interfaces using CakePHP, jQuery, MySQL, Rest & SOAP

## Education


<h3 class="resume-heading">
    <span>BTS Informatique de Gestion, Lycée Dominique Villars, Gap</span>
    <span>2009 - 2011</span>
</h3>

Application Developer specialization. Highest ranking in class, 2nd highest in the "académie"

<h3 class="resume-heading">
    <span>Bac Sciences Economiques et Sociales (mathematics), Lycée Dominique Villars, Gap</span>
    <span>2009</span>
</h3>

## Notable side projects

* [Cuisine-ead](https://github.com/camille-hdl/cuisine-ead), Domain-specific XML processing tool. PWA without a backend hosted on Netlify. [Read more](/cuisine-ead)
* My technical blog, using Gatsby. Most read articles include [Ship modern JS with Rollup](/ship-modern-javascript-rollup/) and [Incident postmortem](/incident-postmortem/)
* [Lazy-lists](https://libraries.io/packagist/camille-hdl%2Flazy-lists), an experimental library to explore transducers in PHP
