# Visual Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans.

**Goal:** aplicar las seis prioridades visuales y entregar comparación real.
**Architecture:** preservar main 4f09649, capa CSS de Pages y componentes compartidos Next; sin cambios DB/API.
**Tech Stack:** Next.js, React, Tailwind, generador estático actual y Chromium.
**Spec:** docs/superpowers/specs/2026-11-14-visual-refresh-design.md

## Global Constraints
- Conservar 579 fichas, 18 categorías y 179 marcas/fuentes existentes.
- No presentar falta de datos como normalidad ni transmitir formularios de demo.
- Preservar main; actualizar gh-pages sin force push.

## Review Focus
- Cascada de CSS claro/oscuro y buscador móvil.
- Teclado en menú y objetivos táctiles.
- Búsqueda y favoritos tras perder foco del input.
- Fichas, gráficas y catálogo completo conservados.

- [x] Capturar baseline actual y reproducir pruebas fallidas.
- [x] Aplicar mejoras y verificar catálogo, UI y CSS Next.
- [x] Revisión independiente y correcciones comprobadas.
- [x] Publicar rama fuente y artefacto estático con evidencia.
