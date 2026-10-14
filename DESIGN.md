---
name: COOL ANIMAL
description: A fresh Colombian frozen-treat shop for dogs.
colors:
  cacao: "#4B2D19"
  cream: "#F1E9DB"
  orange: "#FF8800"
  orange-text: "#984500"
  golden: "#FFD700"
  mint: "#C7EED4"
  glacier: "#A8DADC"
  paper: "#fffefa"
  muted: "#6b594a"
typography:
  display:
    fontFamily: "Manrope, DM Sans, sans-serif"
    fontSize: "clamp(2.5rem, 6.8vw, 5.875rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.075em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  accent:
    fontFamily: "Georgia, serif"
    fontSize: "1em"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.07em"
rounded:
  md: "18px"
spacing:
  section: "108px"
  gutter: "11vw"
  compact: "8px"
components:
  button-primary:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.paper}"
    padding: "0 21px"
    height: "48px"
    rounded: "0px"
  button-primary-hover:
    backgroundColor: "#FF9B24"
---

## Overview

The storefront uses the supplied COOL ANIMAL logo with cream, cacao, orange, and golden yellow at the core. Large, compact headlines and generous open space keep the two flavors and their purchase path immediately legible.

## Colors

Cream is the broad page surface; cacao anchors headlines and copy. Orange and golden yellow lead calls to action and selected details. Burnt orange `#984500` carries text accents where the brighter orange needs more contrast. Mint and glacier blue remain available as restrained flavor accents, as specified in the brand system.

## Typography

The supplied lockup contains the brand's layered display lettering. Manrope carries page headlines and product names; DM Sans keeps navigation, descriptions, and controls practical at phone sizes. Georgia provides the softer italic emphasis used inside headlines.

## Layout

The page starts with a two-column editorial hero, then moves into a two-flavor catalog, emotional brand section, short benefits list, story, social grid, and order call to action. At narrow widths these become a single column, with the products and cart controls remaining easy to reach. The cart is a right-side checkout panel with a full-screen backdrop.

## Elevation & Depth

Product art floats slightly above its field through a soft, offset shadow. The hero product note uses the same restrained shadow. Most page sections stay flat and rely on tonal backgrounds and fine rules for separation.

## Shapes

Product imagery uses tall portrait crops; the hero and closing image use a rounded arch. Product cards stay square-cornered. Small circular marks are reserved for flavor details and compact controls.

## Components

**The Liquid-Glass Rule.** Use translucent cream surfaces, a fine pale edge, soft blur, and restrained depth on navigation, product notes, and checkout. Keep text on solid or sufficiently opaque surfaces. **The Product-First Rule.** Keep flavor, price, and add-to-cart action together in each product panel. **The Honest Order Rule.** Show the delivery charge as pending until a configured or entered value exists; never suggest an invented total.

## Do's and Don'ts

- Keep temporary dog and fruit art clearly labeled until real photography is available.
- Preserve the supplied logo artwork and its original colors.
- Keep cream, cacao, orange, and golden yellow in the foreground; reserve mint and glacier blue for supporting flavor cues.
- Preserve large tap targets and visible keyboard focus in the cart and checkout.
- Keep business contact and delivery data in `config.js`; don't hardcode sample credentials into page copy.
