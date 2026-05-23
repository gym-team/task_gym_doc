
```
prototype_gyme
├─ app
│  ├─ about
│  │  └─ page.tsx
│  ├─ contact
│  │  └─ page.tsx
│  ├─ globals.css
│  ├─ icon.png
│  ├─ layout.tsx
│  ├─ loading.tsx
│  ├─ login
│  │  └─ page.tsx
│  ├─ membership
│  │  └─ page.tsx
│  ├─ page.tsx
│  ├─ plans
│  │  └─ [trackId]
│  │     ├─ page.tsx
│  │     └─ [planId]
│  │        └─ page.tsx
│  ├─ register
│  │  └─ page.tsx
│  ├─ tracks
│  │  └─ page.tsx
│  ├─ trainer
│  │  └─ dashboard
│  │     └─ page.tsx
│  └─ trainers
│     ├─ page.tsx
│     └─ [id]
│        └─ page.tsx
├─ components
│  ├─ auth
│  │  ├─ login-form.tsx
│  │  └─ register-form.tsx
│  ├─ footer.tsx
│  ├─ home
│  │  ├─ cta-section.tsx
│  │  ├─ featured-trainers-section.tsx
│  │  ├─ features-section.tsx
│  │  ├─ hero-section.tsx
│  │  ├─ offers-carousel.tsx
│  │  ├─ shop-preview-section.tsx
│  │  ├─ stats-section.tsx
│  │  └─ testimonials-section.tsx
│  ├─ membership
│  │  ├─ AllPlans.tsx
│  │  ├─ membership-benefits.tsx
│  │  ├─ membership-faq.tsx
│  │  ├─ membership-hero.tsx
│  │  └─ pricing-plans.tsx
│  ├─ navigation.tsx
│  ├─ page-background-wrapper.tsx
│  ├─ page-background.tsx
│  ├─ page-layout.tsx
│  ├─ scroll-animated-card.tsx
│  ├─ scroll-animated-section.tsx
│  ├─ theme-provider.tsx
│  ├─ tracks
│  │  ├─ class-schedule.tsx
│  │  ├─ program-categories.tsx
│  │  └─ programs-hero.tsx
│  ├─ trainers
│  │  ├─ trainer-detail.tsx
│  │  ├─ trainers-grid.tsx
│  │  └─ trainers-hero.tsx
│  └─ ui
│     ├─ accordion.tsx
│     ├─ alert-dialog.tsx
│     ├─ alert.tsx
│     ├─ aspect-ratio.tsx
│     ├─ avatar.tsx
│     ├─ badge.tsx
│     ├─ breadcrumb.tsx
│     ├─ button.tsx
│     ├─ calendar.tsx
│     ├─ card-skeleton.tsx
│     ├─ card.tsx
│     ├─ carousel.tsx
│     ├─ chart.tsx
│     ├─ checkbox.tsx
│     ├─ collapsible.tsx
│     ├─ command.tsx
│     ├─ context-menu.tsx
│     ├─ dialog.tsx
│     ├─ drawer.tsx
│     ├─ dropdown-menu.tsx
│     ├─ form.tsx
│     ├─ hover-card.tsx
│     ├─ input-otp.tsx
│     ├─ input.tsx
│     ├─ label.tsx
│     ├─ menubar.tsx
│     ├─ navigation-menu.tsx
│     ├─ pagination.tsx
│     ├─ popover.tsx
│     ├─ progress.tsx
│     ├─ radio-group.tsx
│     ├─ resizable.tsx
│     ├─ scroll-area.tsx
│     ├─ select.tsx
│     ├─ separator.tsx
│     ├─ sheet.tsx
│     ├─ sidebar.tsx
│     ├─ skeleton-custom.tsx
│     ├─ skeleton.tsx
│     ├─ slider.tsx
│     ├─ sonner.tsx
│     ├─ switch.tsx
│     ├─ table.tsx
│     ├─ tabs.tsx
│     ├─ textarea.tsx
│     ├─ toast.tsx
│     ├─ toaster.tsx
│     ├─ toggle-group.tsx
│     ├─ toggle.tsx
│     ├─ tooltip.tsx
│     ├─ use-mobile.tsx
│     └─ use-toast.ts
├─ components.json
├─ hooks
│  ├─ use-mobile.ts
│  ├─ use-scroll-animation.ts
│  ├─ use-scroll-trigger.ts
│  ├─ use-toast.ts
│  └─ use-typing-effect.ts
├─ lib
│  ├─ membership.ts
│  └─ utils.ts
├─ next.config.mjs
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ public
│  ├─ 14237.jpg
│  ├─ 195.jpg
│  ├─ 24-hour-gym-access.jpg
│  ├─ 3d-gym-equipment.jpg
│  ├─ about-facility-1.jpg
│  ├─ about-facility-2.jpg
│  ├─ abstract-fitness-pattern.png
│  ├─ abstract-geometric-pattern.png
│  ├─ athletic-man-smiling.png
│  ├─ athletic-person-training-in-modern-gym-with-dramat.jpg
│  ├─ athletic-shorts.jpg
│  ├─ athletic-woman-running.jpg
│  ├─ athletic-woman-smiling.jpg
│  ├─ bcaa-supplement.jpg
│  ├─ blog-cardio-comparison.jpg
│  ├─ blog-fitness-lifestyle.jpg
│  ├─ blog-meal-prep.jpg
│  ├─ blog-muscle-building.jpg
│  ├─ blog-nutrition-guide.jpg
│  ├─ blog-nutrition-tips.jpg
│  ├─ blog-post-cardio.jpg
│  ├─ blog-post-nutrition.jpg
│  ├─ blog-post-recovery.jpg
│  ├─ blog-post-strength.jpg
│  ├─ blog-recovery.jpg
│  ├─ blog-transformation-story.jpg
│  ├─ blog-women-strength.jpg
│  ├─ blog-workout-recovery.jpg
│  ├─ blog-yoga-benefits.jpg
│  ├─ cardio-hiit-class.jpg
│  ├─ certificate-ace.jpg
│  ├─ certificate-nasm.jpg
│  ├─ chat-trainer-avatar.jpg
│  ├─ compression-shirt.jpg
│  ├─ contact-page-background.jpg
│  ├─ crossfit-class.jpg
│  ├─ default-trainer.png
│  ├─ diverse-athlete.png
│  ├─ feature-modern-equipment.jpg
│  ├─ feature-nutrition-plan.jpg
│  ├─ feature-personal-coaching.jpg
│  ├─ female-trainer-nutrition.jpg
│  ├─ female-trainer-pilates.jpg
│  ├─ female-trainer-yoga.jpg
│  ├─ fit-woman-smiling-in-gym.jpg
│  ├─ fitness-athlete.jpg
│  ├─ fitness-progress-tracking.jpg
│  ├─ foam-roller.jpg
│  ├─ group-fitness-class.jpg
│  ├─ gym-bag.jpg
│  ├─ gym-training-shirt.jpg
│  ├─ healthy-meal-prep.jpg
│  ├─ icon.svg
│  ├─ lifting-gloves.jpg
│  ├─ male-trainer-cardio.jpg
│  ├─ male-trainer-crossfit.jpg
│  ├─ male-trainer-strength.jpg
│  ├─ martial-arts-class.jpg
│  ├─ modern-gym-equipment.jpg
│  ├─ modern-gym-interior-with-equipment-and-dramatic-li.jpg
│  ├─ modern-gym-interior-with-weights.jpg
│  ├─ muscular-man-in-gym.jpg
│  ├─ OLS5860.jpg
│  ├─ personal-trainer-coaching.jpg
│  ├─ placeholder-logo.png
│  ├─ placeholder-logo.svg
│  ├─ placeholder-user.jpg
│  ├─ placeholder.jpg
│  ├─ placeholder.svg
│  ├─ pre-workout-supplement.jpg
│  ├─ product-dumbbells-set.jpg
│  ├─ product-dumbbells.jpg
│  ├─ product-gym-gloves.jpg
│  ├─ product-protein-powder.jpg
│  ├─ product-resistance-bands.jpg
│  ├─ product-water-bottle.jpg
│  ├─ product-whey-protein.jpg
│  ├─ product-yoga-mat.jpg
│  ├─ program-category-cardio.jpg
│  ├─ program-category-crossfit.jpg
│  ├─ program-category-strength.jpg
│  ├─ program-category-yoga.jpg
│  ├─ resistance-bands.jpg
│  ├─ shaker-bottle.jpg
│  ├─ sport-lifestyle-fitness-male-training.jpg
│  ├─ strength-training-class.jpg
│  ├─ strong-man-training-gym.jpg
│  ├─ testimonial-client-female.jpg
│  ├─ testimonial-client-male.jpg
│  ├─ testimonial-client-other.jpg
│  ├─ testimonial-success-1.jpg
│  ├─ testimonial-success-2.jpg
│  ├─ testimonial-success-3.jpg
│  ├─ trainer-1-male.jpg
│  ├─ trainer-2-female.jpg
│  ├─ trainer-3-specialist.jpg
│  ├─ trainer-profile-female-1.jpg
│  ├─ trainer-profile-male-1.jpg
│  ├─ trainer-profile-specialist.jpg
│  ├─ training-hall-gym-interior.jpg
│  ├─ user-profile-avatar.jpg
│  ├─ view-gym-room-training-sports.jpg
│  ├─ view-gym-room-training-sports22.jpg
│  ├─ view-gym-room-training-sports222.jpg
│  ├─ visits.json
│  ├─ wellness-class.jpg
│  ├─ whey-protein-powder.jpg
│  ├─ yoga-class.jpg
│  ├─ yoga-instructor-woman.png
│  └─ yoga-mat.jpg
├─ README.md
├─ styles
│  ├─ globals.css
│  ├─ membership-benefits.css
│  ├─ membership-hero.css
│  └─ pricing-plans.css
└─ tsconfig.json

```