
```
prototype_gyme
├─ app
│  ├─ about
│  │  └─ page.tsx
│  ├─ admin
│  │  ├─ exercise
│  │  │  └─ page.tsx
│  │  └─ page.tsx
│  ├─ ai-assistant
│  │  └─ page.tsx
│  ├─ api
│  │  └─ upload
│  │     └─ route.ts
│  ├─ chat
│  │  └─ [trainerId]
│  │     └─ page.tsx
│  ├─ coach
│  │  ├─ checkins
│  │  │  ├─ page.tsx
│  │  │  └─ [checkInId]
│  │  │     └─ page.tsx
│  │  ├─ coach.css
│  │  ├─ constraints
│  │  │  └─ [enrollmentId]
│  │  │     └─ page.tsx
│  │  ├─ foods
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ plans
│  │  │  ├─ create
│  │  │  │  └─ page.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ [planId]
│  │  │     ├─ edit
│  │  │     │  └─ page.tsx
│  │  │     ├─ page.tsx
│  │  │     └─ weeks
│  │  │        ├─ page.tsx
│  │  │        └─ [weekId]
│  │  │           └─ page.tsx
│  │  └─ program
│  │     ├─ create
│  │     │  └─ page.tsx
│  │     ├─ exercise
│  │     │  └─ page.tsx
│  │     ├─ page.tsx
│  │     └─ [programId]
│  │        ├─ edit
│  │        │  ├─ page.tsx
│  │        │  └─ weeks
│  │        │     └─ page.tsx
│  │        ├─ page.tsx
│  │        └─ weeks
│  │           ├─ page.tsx
│  │           └─ [weekId]
│  │              └─ page.tsx
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
│  ├─ nutrition
│  │  ├─ enrollments
│  │  │  ├─ page.tsx
│  │  │  └─ [enrollmentId]
│  │  │     ├─ checkin
│  │  │     │  └─ page.tsx
│  │  │     ├─ page.tsx
│  │  │     ├─ progress
│  │  │     │  └─ page.tsx
│  │  │     └─ week
│  │  │        └─ [weekNumber]
│  │  │           └─ page.tsx
│  │  ├─ page.tsx
│  │  └─ [planId]
│  │     └─ page.tsx
│  ├─ page.tsx
│  ├─ payment
│  │  └─ page.tsx
│  ├─ plans
│  │  └─ [trackId]
│  │     ├─ page.tsx
│  │     └─ [planId]
│  │        └─ page.tsx
│  ├─ profile
│  │  └─ page.tsx
│  ├─ program
│  │  ├─ page.tsx
│  │  └─ [sessionId]
│  │     └─ page.tsx
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
│  ├─ coach
│  │  ├─ coach-hero.tsx
│  │  ├─ constraints-form.tsx
│  │  ├─ decision-modal.tsx
│  │  ├─ food-form.tsx
│  │  ├─ plan-form.tsx
│  │  ├─ queue-card.tsx
│  │  ├─ review-panel.tsx
│  │  └─ week-form.tsx
│  ├─ footer.tsx
│  ├─ HexGymBackground.tsx
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
│  │  ├─ membership-status.tsx
│  │  ├─ payment-modal.tsx
│  │  └─ pricing-plans.tsx
│  ├─ navigation.tsx
│  ├─ nutrition
│  │  ├─ checkin-form.tsx
│  │  ├─ day-card.tsx
│  │  ├─ enrollment-card.tsx
│  │  ├─ food-item.tsx
│  │  ├─ meal-card.tsx
│  │  ├─ plan-card.tsx
│  │  ├─ plan-details.tsx
│  │  ├─ progress-chart.tsx
│  │  ├─ tdee-preview-modal.tsx
│  │  └─ week-view.tsx
│  ├─ page-background-wrapper.tsx
│  ├─ page-background.tsx
│  ├─ page-layout.tsx
│  ├─ plans
│  │  ├─ filters.tsx
│  │  ├─ pagination.tsx
│  │  └─ plan-card.tsx
│  ├─ PremiumGymBackground.tsx
│  ├─ scroll-animated-card.tsx
│  ├─ scroll-animated-section.tsx
│  ├─ theme-provider.tsx
│  ├─ tracks
│  │  ├─ class-schedule.tsx
│  │  ├─ track-categories.tsx
│  │  └─ tracks-hero.tsx
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
│  ├─ use-current-user.ts
│  ├─ use-mobile.ts
│  ├─ use-scroll-animation.ts
│  ├─ use-scroll-trigger.ts
│  ├─ use-toast.ts
│  └─ use-typing-effect.ts
├─ lib
│  ├─ api-client.ts
│  ├─ format.ts
│  ├─ membership.ts
│  ├─ nutrition-plan-enums.ts
│  ├─ program-enums.ts
│  ├─ Trainee.ts
│  ├─ use-fade-up.ts
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
│  ├─ plansimagedeful.png
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
│  ├─ uploads
│  │  ├─ 1782381222794-5fa73e51-9ca7-4af2-aba4-25176e2f7994.jpg
│  │  ├─ 1782381957006-f9ccaca2-75db-407e-83bd-687141901b0b.jpg
│  │  ├─ 1782413247335-209a7471-cd2d-4faf-bc6d-81efd734daee.jpg
│  │  ├─ 1782413360807-2799a21d-8f30-4964-bb3b-06dc96932bac.jpg
│  │  ├─ 1782413391978-f939b686-4c25-4b39-af17-5562a84dac5b.jpg
│  │  ├─ 1782413455894-4e3a5814-8395-4211-a881-a4d6d37ba87d.jpg
│  │  ├─ 1782413809010-d3986f4d-2ee3-4222-999c-03a18570148a.jpg
│  │  ├─ 1782413892365-0476cb5d-cd5c-4485-94b9-93687df6149d.jpg
│  │  ├─ 1782435790935-63e61874-075f-453d-80f8-af47965f7a4e.jpg
│  │  ├─ 1782435904070-f8433fa7-4057-401b-b600-0c4fb22d442e.jpg
│  │  ├─ 1782436737040-5f566b43-1135-4bc9-9285-7e4cdcc8059b.jpg
│  │  └─ nutrition-plans
│  │     └─ 1782261626738-b00db9c8-116d-4e5f-8640-8554a6963ae0-whatsapp-image-2026-05-03-at-2.16.58-am.jpeg.jpeg
│  ├─ user-profile-avatar.jpg
│  ├─ vecteezy_futuristic-sport-gym-interior-with-sleek-cardio-equipment_62266051.mp4
│  ├─ vecteezy_intense-workout-recovery-with-athletic-man-drinking-water-in_74682628.mp4
│  ├─ vecteezy_modern-neon-lit-gym-interior-featuring-treadmills-and_62263172.mp4
│  ├─ vecteezy_sport-athlete-man-and-woman-wearing-clothes-running-on_27475041.mp4
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
├─ services
│  ├─ api.ts
│  ├─ auth.ts
│  ├─ chatbo.ts
│  ├─ checkin.ts
│  ├─ coach-checkin.ts
│  ├─ coach-constraint.ts
│  ├─ coach-dashboard.ts
│  ├─ coach-food.ts
│  ├─ coach-plan.ts
│  ├─ coach.ts
│  ├─ constraints.ts
│  ├─ dashboard.ts
│  ├─ food.ts
│  ├─ foodItem.ts
│  ├─ nutrition-enrollment.ts
│  ├─ nutrition-plan.ts
│  └─ nutrition-week.ts
├─ styles
│  ├─ globals.css
│  ├─ membership-benefits.css
│  ├─ membership-hero.css
│  ├─ pricing-plans.css
│  ├─ Track_hero.css
│  └─ trainers-hero.css
├─ tailwind.config.ts
├─ tsconfig.json
└─ types
   ├─ api-response.ts
   ├─ coach-checkin.ts
   ├─ coach-constraint.ts
   ├─ coach-dashboard.ts
   ├─ coach-food.ts
   ├─ coach-plan.ts
   ├─ constraints.ts
   ├─ dashboard.ts
   ├─ day-protocol.ts
   ├─ enrollment.ts
   ├─ food.ts
   ├─ fooditem.ts
   ├─ meal.ts
   ├─ nutrition-plan.ts
   ├─ nutrition-week.ts
   └─ user.ts

```
```
prototype_gyme
├─ app
│  ├─ about
│  │  └─ page.tsx
│  ├─ admin
│  │  ├─ exercise
│  │  │  └─ page.tsx
│  │  └─ page.tsx
│  ├─ ai-assistant
│  │  └─ page.tsx
│  ├─ api
│  │  └─ upload
│  │     └─ route.ts
│  ├─ chat
│  │  └─ [trainerId]
│  │     └─ page.tsx
│  ├─ coach
│  │  ├─ checkins
│  │  │  ├─ page.tsx
│  │  │  └─ [checkInId]
│  │  │     └─ page.tsx
│  │  ├─ coach.css
│  │  ├─ constraints
│  │  │  └─ [enrollmentId]
│  │  │     └─ page.tsx
│  │  ├─ foods
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ plans
│  │  │  ├─ create
│  │  │  │  └─ page.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ [planId]
│  │  │     ├─ edit
│  │  │     │  └─ page.tsx
│  │  │     ├─ page.tsx
│  │  │     └─ weeks
│  │  │        ├─ page.tsx
│  │  │        └─ [weekId]
│  │  │           └─ page.tsx
│  │  └─ program
│  │     ├─ create
│  │     │  └─ page.tsx
│  │     ├─ exercise
│  │     │  └─ page.tsx
│  │     ├─ page.tsx
│  │     └─ [programId]
│  │        ├─ edit
│  │        │  ├─ page.tsx
│  │        │  └─ weeks
│  │        │     └─ page.tsx
│  │        ├─ page.tsx
│  │        └─ weeks
│  │           ├─ page.tsx
│  │           └─ [weekId]
│  │              └─ page.tsx
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
│  ├─ nutrition
│  │  ├─ enrollments
│  │  │  ├─ page.tsx
│  │  │  └─ [enrollmentId]
│  │  │     ├─ checkin
│  │  │     │  └─ page.tsx
│  │  │     ├─ page.tsx
│  │  │     ├─ progress
│  │  │     │  └─ page.tsx
│  │  │     └─ week
│  │  │        └─ [weekNumber]
│  │  │           └─ page.tsx
│  │  ├─ page.tsx
│  │  └─ [planId]
│  │     └─ page.tsx
│  ├─ page.tsx
│  ├─ payment
│  │  └─ page.tsx
│  ├─ plans
│  │  └─ [trackId]
│  │     ├─ page.tsx
│  │     └─ [planId]
│  │        └─ page.tsx
│  ├─ profile
│  │  └─ page.tsx
│  ├─ program
│  │  ├─ page.tsx
│  │  └─ [sessionId]
│  │     └─ page.tsx
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
│  ├─ coach
│  │  ├─ coach-hero.tsx
│  │  ├─ constraints-form.tsx
│  │  ├─ decision-modal.tsx
│  │  ├─ food-form.tsx
│  │  ├─ plan-form.tsx
│  │  ├─ queue-card.tsx
│  │  ├─ review-panel.tsx
│  │  └─ week-form.tsx
│  ├─ footer.tsx
│  ├─ HexGymBackground.tsx
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
│  │  ├─ membership-status.tsx
│  │  ├─ payment-modal.tsx
│  │  └─ pricing-plans.tsx
│  ├─ navigation.tsx
│  ├─ nutrition
│  │  ├─ checkin-form.tsx
│  │  ├─ day-card.tsx
│  │  ├─ enrollment-card.tsx
│  │  ├─ food-item.tsx
│  │  ├─ meal-card.tsx
│  │  ├─ plan-card.tsx
│  │  ├─ plan-details.tsx
│  │  ├─ progress-chart.tsx
│  │  ├─ tdee-preview-modal.tsx
│  │  └─ week-view.tsx
│  ├─ page-background-wrapper.tsx
│  ├─ page-background.tsx
│  ├─ page-layout.tsx
│  ├─ plans
│  │  ├─ filters.tsx
│  │  ├─ pagination.tsx
│  │  └─ plan-card.tsx
│  ├─ PremiumGymBackground.tsx
│  ├─ scroll-animated-card.tsx
│  ├─ scroll-animated-section.tsx
│  ├─ theme-provider.tsx
│  ├─ tracks
│  │  ├─ class-schedule.tsx
│  │  ├─ track-categories.tsx
│  │  └─ tracks-hero.tsx
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
│  ├─ use-current-user.ts
│  ├─ use-mobile.ts
│  ├─ use-scroll-animation.ts
│  ├─ use-scroll-trigger.ts
│  ├─ use-toast.ts
│  └─ use-typing-effect.ts
├─ lib
│  ├─ api-client.ts
│  ├─ format.ts
│  ├─ membership.ts
│  ├─ nutrition-plan-enums.ts
│  ├─ program-enums.ts
│  ├─ Trainee.ts
│  ├─ use-fade-up.ts
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
│  ├─ plansimagedeful.png
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
│  ├─ uploads
│  │  ├─ 1782381222794-5fa73e51-9ca7-4af2-aba4-25176e2f7994.jpg
│  │  ├─ 1782381957006-f9ccaca2-75db-407e-83bd-687141901b0b.jpg
│  │  ├─ 1782413247335-209a7471-cd2d-4faf-bc6d-81efd734daee.jpg
│  │  ├─ 1782413360807-2799a21d-8f30-4964-bb3b-06dc96932bac.jpg
│  │  ├─ 1782413391978-f939b686-4c25-4b39-af17-5562a84dac5b.jpg
│  │  ├─ 1782413455894-4e3a5814-8395-4211-a881-a4d6d37ba87d.jpg
│  │  ├─ 1782413809010-d3986f4d-2ee3-4222-999c-03a18570148a.jpg
│  │  ├─ 1782413892365-0476cb5d-cd5c-4485-94b9-93687df6149d.jpg
│  │  ├─ 1782435790935-63e61874-075f-453d-80f8-af47965f7a4e.jpg
│  │  ├─ 1782435904070-f8433fa7-4057-401b-b600-0c4fb22d442e.jpg
│  │  ├─ 1782436737040-5f566b43-1135-4bc9-9285-7e4cdcc8059b.jpg
│  │  └─ nutrition-plans
│  │     └─ 1782261626738-b00db9c8-116d-4e5f-8640-8554a6963ae0-whatsapp-image-2026-05-03-at-2.16.58-am.jpeg.jpeg
│  ├─ user-profile-avatar.jpg
│  ├─ vecteezy_futuristic-sport-gym-interior-with-sleek-cardio-equipment_62266051.mp4
│  ├─ vecteezy_intense-workout-recovery-with-athletic-man-drinking-water-in_74682628.mp4
│  ├─ vecteezy_modern-neon-lit-gym-interior-featuring-treadmills-and_62263172.mp4
│  ├─ vecteezy_sport-athlete-man-and-woman-wearing-clothes-running-on_27475041.mp4
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
├─ services
│  ├─ api.ts
│  ├─ auth.ts
│  ├─ chatbo.ts
│  ├─ checkin.ts
│  ├─ coach-checkin.ts
│  ├─ coach-constraint.ts
│  ├─ coach-dashboard.ts
│  ├─ coach-food.ts
│  ├─ coach-plan.ts
│  ├─ coach.ts
│  ├─ constraints.ts
│  ├─ dashboard.ts
│  ├─ food.ts
│  ├─ foodItem.ts
│  ├─ nutrition-enrollment.ts
│  ├─ nutrition-plan.ts
│  └─ nutrition-week.ts
├─ styles
│  ├─ globals.css
│  ├─ membership-benefits.css
│  ├─ membership-hero.css
│  ├─ pricing-plans.css
│  ├─ Track_hero.css
│  └─ trainers-hero.css
├─ tailwind.config.ts
├─ tsconfig.json
└─ types
   ├─ api-response.ts
   ├─ coach-checkin.ts
   ├─ coach-constraint.ts
   ├─ coach-dashboard.ts
   ├─ coach-food.ts
   ├─ coach-plan.ts
   ├─ constraints.ts
   ├─ dashboard.ts
   ├─ day-protocol.ts
   ├─ enrollment.ts
   ├─ food.ts
   ├─ fooditem.ts
   ├─ meal.ts
   ├─ nutrition-plan.ts
   ├─ nutrition-week.ts
   └─ user.ts

```
```
prototype_gyme
├─ app
│  ├─ about
│  │  └─ page.tsx
│  ├─ admin
│  │  ├─ exercise
│  │  │  └─ page.tsx
│  │  └─ page.tsx
│  ├─ ai-assistant
│  │  └─ page.tsx
│  ├─ api
│  │  └─ upload
│  │     └─ route.ts
│  ├─ chat
│  │  └─ [trainerId]
│  │     └─ page.tsx
│  ├─ coach
│  │  ├─ checkins
│  │  │  ├─ page.tsx
│  │  │  └─ [checkInId]
│  │  │     └─ page.tsx
│  │  ├─ coach.css
│  │  ├─ constraints
│  │  │  └─ [enrollmentId]
│  │  │     └─ page.tsx
│  │  ├─ foods
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ plans
│  │  │  ├─ create
│  │  │  │  └─ page.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ [planId]
│  │  │     ├─ edit
│  │  │     │  └─ page.tsx
│  │  │     ├─ page.tsx
│  │  │     └─ weeks
│  │  │        ├─ page.tsx
│  │  │        └─ [weekId]
│  │  │           └─ page.tsx
│  │  └─ program
│  │     ├─ create
│  │     │  └─ page.tsx
│  │     ├─ exercise
│  │     │  └─ page.tsx
│  │     ├─ page.tsx
│  │     └─ [programId]
│  │        ├─ edit
│  │        │  ├─ page.tsx
│  │        │  └─ weeks
│  │        │     └─ page.tsx
│  │        ├─ page.tsx
│  │        └─ weeks
│  │           ├─ page.tsx
│  │           └─ [weekId]
│  │              └─ page.tsx
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
│  ├─ nutrition
│  │  ├─ enrollments
│  │  │  ├─ page.tsx
│  │  │  └─ [enrollmentId]
│  │  │     ├─ checkin
│  │  │     │  └─ page.tsx
│  │  │     ├─ page.tsx
│  │  │     ├─ progress
│  │  │     │  └─ page.tsx
│  │  │     └─ week
│  │  │        └─ [weekNumber]
│  │  │           └─ page.tsx
│  │  ├─ page.tsx
│  │  └─ [planId]
│  │     └─ page.tsx
│  ├─ page.tsx
│  ├─ payment
│  │  └─ page.tsx
│  ├─ plans
│  │  └─ [trackId]
│  │     ├─ page.tsx
│  │     └─ [planId]
│  │        └─ page.tsx
│  ├─ profile
│  │  └─ page.tsx
│  ├─ program
│  │  ├─ page.tsx
│  │  └─ [sessionId]
│  │     └─ page.tsx
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
│  ├─ coach
│  │  ├─ coach-hero.tsx
│  │  ├─ constraints-form.tsx
│  │  ├─ decision-modal.tsx
│  │  ├─ food-form.tsx
│  │  ├─ plan-form.tsx
│  │  ├─ queue-card.tsx
│  │  ├─ review-panel.tsx
│  │  └─ week-form.tsx
│  ├─ footer.tsx
│  ├─ HexGymBackground.tsx
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
│  │  ├─ membership-status.tsx
│  │  ├─ payment-modal.tsx
│  │  └─ pricing-plans.tsx
│  ├─ navigation.tsx
│  ├─ nutrition
│  │  ├─ checkin-form.tsx
│  │  ├─ day-card.tsx
│  │  ├─ enrollment-card.tsx
│  │  ├─ food-item.tsx
│  │  ├─ meal-card.tsx
│  │  ├─ plan-card.tsx
│  │  ├─ plan-details.tsx
│  │  ├─ progress-chart.tsx
│  │  ├─ tdee-preview-modal.tsx
│  │  └─ week-view.tsx
│  ├─ page-background-wrapper.tsx
│  ├─ page-background.tsx
│  ├─ page-layout.tsx
│  ├─ plans
│  │  ├─ filters.tsx
│  │  ├─ pagination.tsx
│  │  └─ plan-card.tsx
│  ├─ PremiumGymBackground.tsx
│  ├─ scroll-animated-card.tsx
│  ├─ scroll-animated-section.tsx
│  ├─ theme-provider.tsx
│  ├─ tracks
│  │  ├─ class-schedule.tsx
│  │  ├─ track-categories.tsx
│  │  └─ tracks-hero.tsx
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
│  ├─ use-current-user.ts
│  ├─ use-mobile.ts
│  ├─ use-scroll-animation.ts
│  ├─ use-scroll-trigger.ts
│  ├─ use-toast.ts
│  └─ use-typing-effect.ts
├─ lib
│  ├─ api-client.ts
│  ├─ format.ts
│  ├─ membership.ts
│  ├─ nutrition-plan-enums.ts
│  ├─ program-enums.ts
│  ├─ Trainee.ts
│  ├─ use-fade-up.ts
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
│  ├─ plansimagedeful.png
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
│  ├─ uploads
│  │  ├─ 1782381222794-5fa73e51-9ca7-4af2-aba4-25176e2f7994.jpg
│  │  ├─ 1782381957006-f9ccaca2-75db-407e-83bd-687141901b0b.jpg
│  │  ├─ 1782413247335-209a7471-cd2d-4faf-bc6d-81efd734daee.jpg
│  │  ├─ 1782413360807-2799a21d-8f30-4964-bb3b-06dc96932bac.jpg
│  │  ├─ 1782413391978-f939b686-4c25-4b39-af17-5562a84dac5b.jpg
│  │  ├─ 1782413455894-4e3a5814-8395-4211-a881-a4d6d37ba87d.jpg
│  │  ├─ 1782413809010-d3986f4d-2ee3-4222-999c-03a18570148a.jpg
│  │  ├─ 1782413892365-0476cb5d-cd5c-4485-94b9-93687df6149d.jpg
│  │  ├─ 1782435790935-63e61874-075f-453d-80f8-af47965f7a4e.jpg
│  │  ├─ 1782435904070-f8433fa7-4057-401b-b600-0c4fb22d442e.jpg
│  │  ├─ 1782436737040-5f566b43-1135-4bc9-9285-7e4cdcc8059b.jpg
│  │  └─ nutrition-plans
│  │     └─ 1782261626738-b00db9c8-116d-4e5f-8640-8554a6963ae0-whatsapp-image-2026-05-03-at-2.16.58-am.jpeg.jpeg
│  ├─ user-profile-avatar.jpg
│  ├─ vecteezy_futuristic-sport-gym-interior-with-sleek-cardio-equipment_62266051.mp4
│  ├─ vecteezy_intense-workout-recovery-with-athletic-man-drinking-water-in_74682628.mp4
│  ├─ vecteezy_modern-neon-lit-gym-interior-featuring-treadmills-and_62263172.mp4
│  ├─ vecteezy_sport-athlete-man-and-woman-wearing-clothes-running-on_27475041.mp4
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
├─ services
│  ├─ api.ts
│  ├─ auth.ts
│  ├─ chatbo.ts
│  ├─ checkin.ts
│  ├─ coach-checkin.ts
│  ├─ coach-constraint.ts
│  ├─ coach-dashboard.ts
│  ├─ coach-food.ts
│  ├─ coach-plan.ts
│  ├─ coach.ts
│  ├─ constraints.ts
│  ├─ dashboard.ts
│  ├─ food.ts
│  ├─ foodItem.ts
│  ├─ nutrition-enrollment.ts
│  ├─ nutrition-plan.ts
│  └─ nutrition-week.ts
├─ styles
│  ├─ globals.css
│  ├─ membership-benefits.css
│  ├─ membership-hero.css
│  ├─ pricing-plans.css
│  ├─ Track_hero.css
│  └─ trainers-hero.css
├─ tailwind.config.ts
├─ tsconfig.json
└─ types
   ├─ api-response.ts
   ├─ coach-checkin.ts
   ├─ coach-constraint.ts
   ├─ coach-dashboard.ts
   ├─ coach-food.ts
   ├─ coach-plan.ts
   ├─ constraints.ts
   ├─ dashboard.ts
   ├─ day-protocol.ts
   ├─ enrollment.ts
   ├─ food.ts
   ├─ fooditem.ts
   ├─ meal.ts
   ├─ nutrition-plan.ts
   ├─ nutrition-week.ts
   └─ user.ts

```
```
prototype_gyme
├─ app
│  ├─ about
│  │  └─ page.tsx
│  ├─ admin
│  │  ├─ exercise
│  │  │  └─ page.tsx
│  │  └─ page.tsx
│  ├─ ai-assistant
│  │  └─ page.tsx
│  ├─ api
│  │  └─ upload
│  │     └─ route.ts
│  ├─ chat
│  │  └─ [trainerId]
│  │     └─ page.tsx
│  ├─ coach
│  │  ├─ checkins
│  │  │  ├─ page.tsx
│  │  │  └─ [checkInId]
│  │  │     └─ page.tsx
│  │  ├─ coach.css
│  │  ├─ constraints
│  │  │  └─ [enrollmentId]
│  │  │     └─ page.tsx
│  │  ├─ foods
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ plans
│  │  │  ├─ create
│  │  │  │  └─ page.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ [planId]
│  │  │     ├─ edit
│  │  │     │  └─ page.tsx
│  │  │     ├─ page.tsx
│  │  │     └─ weeks
│  │  │        ├─ page.tsx
│  │  │        └─ [weekId]
│  │  │           └─ page.tsx
│  │  └─ program
│  │     ├─ create
│  │     │  └─ page.tsx
│  │     ├─ exercise
│  │     │  └─ page.tsx
│  │     ├─ page.tsx
│  │     └─ [programId]
│  │        ├─ edit
│  │        │  ├─ page.tsx
│  │        │  └─ weeks
│  │        │     └─ page.tsx
│  │        ├─ page.tsx
│  │        └─ weeks
│  │           ├─ page.tsx
│  │           └─ [weekId]
│  │              └─ page.tsx
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
│  ├─ nutrition
│  │  ├─ enrollments
│  │  │  ├─ page.tsx
│  │  │  └─ [enrollmentId]
│  │  │     ├─ checkin
│  │  │     │  └─ page.tsx
│  │  │     ├─ page.tsx
│  │  │     ├─ progress
│  │  │     │  └─ page.tsx
│  │  │     └─ week
│  │  │        └─ [weekNumber]
│  │  │           └─ page.tsx
│  │  ├─ page.tsx
│  │  └─ [planId]
│  │     └─ page.tsx
│  ├─ page.tsx
│  ├─ payment
│  │  └─ page.tsx
│  ├─ plans
│  │  └─ [trackId]
│  │     ├─ page.tsx
│  │     └─ [planId]
│  │        └─ page.tsx
│  ├─ profile
│  │  └─ page.tsx
│  ├─ program
│  │  ├─ page.tsx
│  │  └─ [sessionId]
│  │     └─ page.tsx
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
│  ├─ coach
│  │  ├─ coach-hero.tsx
│  │  ├─ constraints-form.tsx
│  │  ├─ decision-modal.tsx
│  │  ├─ food-form.tsx
│  │  ├─ plan-form.tsx
│  │  ├─ queue-card.tsx
│  │  ├─ review-panel.tsx
│  │  └─ week-form.tsx
│  ├─ footer.tsx
│  ├─ HexGymBackground.tsx
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
│  │  ├─ membership-status.tsx
│  │  ├─ payment-modal.tsx
│  │  └─ pricing-plans.tsx
│  ├─ navigation.tsx
│  ├─ nutrition
│  │  ├─ checkin-form.tsx
│  │  ├─ day-card.tsx
│  │  ├─ enrollment-card.tsx
│  │  ├─ food-item.tsx
│  │  ├─ meal-card.tsx
│  │  ├─ plan-card.tsx
│  │  ├─ plan-details.tsx
│  │  ├─ progress-chart.tsx
│  │  ├─ tdee-preview-modal.tsx
│  │  └─ week-view.tsx
│  ├─ page-background-wrapper.tsx
│  ├─ page-background.tsx
│  ├─ page-layout.tsx
│  ├─ plans
│  │  ├─ filters.tsx
│  │  ├─ pagination.tsx
│  │  └─ plan-card.tsx
│  ├─ PremiumGymBackground.tsx
│  ├─ scroll-animated-card.tsx
│  ├─ scroll-animated-section.tsx
│  ├─ theme-provider.tsx
│  ├─ tracks
│  │  ├─ class-schedule.tsx
│  │  ├─ track-categories.tsx
│  │  └─ tracks-hero.tsx
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
│  ├─ use-current-user.ts
│  ├─ use-mobile.ts
│  ├─ use-scroll-animation.ts
│  ├─ use-scroll-trigger.ts
│  ├─ use-toast.ts
│  └─ use-typing-effect.ts
├─ lib
│  ├─ api-client.ts
│  ├─ format.ts
│  ├─ membership.ts
│  ├─ nutrition-plan-enums.ts
│  ├─ program-enums.ts
│  ├─ Trainee.ts
│  ├─ use-fade-up.ts
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
│  ├─ plansimagedeful.png
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
│  ├─ uploads
│  │  ├─ 1782381222794-5fa73e51-9ca7-4af2-aba4-25176e2f7994.jpg
│  │  ├─ 1782381957006-f9ccaca2-75db-407e-83bd-687141901b0b.jpg
│  │  ├─ 1782413247335-209a7471-cd2d-4faf-bc6d-81efd734daee.jpg
│  │  ├─ 1782413360807-2799a21d-8f30-4964-bb3b-06dc96932bac.jpg
│  │  ├─ 1782413391978-f939b686-4c25-4b39-af17-5562a84dac5b.jpg
│  │  ├─ 1782413455894-4e3a5814-8395-4211-a881-a4d6d37ba87d.jpg
│  │  ├─ 1782413809010-d3986f4d-2ee3-4222-999c-03a18570148a.jpg
│  │  ├─ 1782413892365-0476cb5d-cd5c-4485-94b9-93687df6149d.jpg
│  │  ├─ 1782435790935-63e61874-075f-453d-80f8-af47965f7a4e.jpg
│  │  ├─ 1782435904070-f8433fa7-4057-401b-b600-0c4fb22d442e.jpg
│  │  ├─ 1782436737040-5f566b43-1135-4bc9-9285-7e4cdcc8059b.jpg
│  │  └─ nutrition-plans
│  │     └─ 1782261626738-b00db9c8-116d-4e5f-8640-8554a6963ae0-whatsapp-image-2026-05-03-at-2.16.58-am.jpeg.jpeg
│  ├─ user-profile-avatar.jpg
│  ├─ vecteezy_futuristic-sport-gym-interior-with-sleek-cardio-equipment_62266051.mp4
│  ├─ vecteezy_intense-workout-recovery-with-athletic-man-drinking-water-in_74682628.mp4
│  ├─ vecteezy_modern-neon-lit-gym-interior-featuring-treadmills-and_62263172.mp4
│  ├─ vecteezy_sport-athlete-man-and-woman-wearing-clothes-running-on_27475041.mp4
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
├─ services
│  ├─ api.ts
│  ├─ auth.ts
│  ├─ chatbo.ts
│  ├─ checkin.ts
│  ├─ coach-checkin.ts
│  ├─ coach-constraint.ts
│  ├─ coach-dashboard.ts
│  ├─ coach-food.ts
│  ├─ coach-plan.ts
│  ├─ coach.ts
│  ├─ constraints.ts
│  ├─ dashboard.ts
│  ├─ food.ts
│  ├─ foodItem.ts
│  ├─ nutrition-enrollment.ts
│  ├─ nutrition-plan.ts
│  └─ nutrition-week.ts
├─ styles
│  ├─ globals.css
│  ├─ membership-benefits.css
│  ├─ membership-hero.css
│  ├─ pricing-plans.css
│  ├─ Track_hero.css
│  └─ trainers-hero.css
├─ tailwind.config.ts
├─ tsconfig.json
└─ types
   ├─ api-response.ts
   ├─ coach-checkin.ts
   ├─ coach-constraint.ts
   ├─ coach-dashboard.ts
   ├─ coach-food.ts
   ├─ coach-plan.ts
   ├─ constraints.ts
   ├─ dashboard.ts
   ├─ day-protocol.ts
   ├─ enrollment.ts
   ├─ food.ts
   ├─ fooditem.ts
   ├─ meal.ts
   ├─ nutrition-plan.ts
   ├─ nutrition-week.ts
   └─ user.ts

```