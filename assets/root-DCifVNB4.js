import{w as a,a as i,j as e,M as l,b as c,S as h,c as m,O as d,i as p}from"./chunk-EPOLDU6W-B5LwAila.js";import{T as u}from"./theme-provider-BI6ghFmW.js";const f="/assets/app-DqYvjlOc.css",g=()=>[{rel:"preload",as:"font",href:"/fonts/inter-latin-wght-normal.woff2",type:"font/woff2",crossOrigin:"anonymous"},{rel:"prefetch",as:"font",href:"/fonts/inter-latin-wght-italic.woff2",type:"font/woff2",crossOrigin:"anonymous"},{rel:"stylesheet",href:f}];function y({children:s}){return e.jsxs("html",{lang:"en",suppressHydrationWarning:!0,children:[e.jsxs("head",{children:[e.jsx("meta",{charSet:"utf-8"}),e.jsx("meta",{name:"viewport",content:"width=device-width, initial-scale=1"}),e.jsx(l,{}),e.jsx(c,{}),e.jsx("script",{dangerouslySetInnerHTML:{__html:`
              (function() {
                const theme = localStorage.getItem('theme');
                const root = document.documentElement;
                root.classList.remove('light', 'dark');
                
                if (theme && ['light', 'dark'].includes(theme)) {
                  root.classList.add(theme);
                } else {
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  root.classList.add(systemTheme);
                  localStorage.setItem('theme', systemTheme);
                }
              })();
            `}}),e.jsx("noscript",{children:e.jsx("style",{children:".theme-toggle-wrapper { display: none !important; }"})})]}),e.jsx("body",{className:"font-base",children:e.jsxs(u,{defaultTheme:"light",children:[s,e.jsx(h,{}),e.jsx(m,{})]})})]})}const w=a(function(){return e.jsx(d,{})}),T=i(function({error:t}){let r="Oops!",o="An unexpected error occurred.",n;return p(t)&&(r=t.status===404?"404":"Error",o=t.status===404?"The requested page could not be found.":t.statusText||o),e.jsxs("main",{className:"container mx-auto p-4 pt-16",children:[e.jsx("h1",{children:r}),e.jsx("p",{children:o}),n]})});export{T as ErrorBoundary,y as Layout,w as default,g as links};
