# Accessible Component Fundamentals — Notes

## Components Built

For this assignment, I built three interactive components from scratch using React and TypeScript:

* Modal Dialog
* Tabs
* Disclosure

I implemented the required keyboard interactions, ARIA attributes, and focus management manually.

## Comparison with shadcn/ui

### 1. Dialog focus and accessibility behavior

My manual Modal required me to implement focus management myself. I manually moved focus into the dialog, trapped Tab navigation inside the dialog, handled the Escape key, and returned focus to the previously focused element when the dialog closed.

The shadcn Dialog is built on the `@base-ui/react/dialog` primitive. This means the underlying dialog behavior is delegated to an accessibility-focused primitive instead of requiring the complete behavior to be implemented manually in the component.

### 2. Dialog has more reusable parts

My Modal is a single component with a close button.

The shadcn implementation provides separate reusable components including:

* `Dialog`
* `DialogTrigger`
* `DialogClose`
* `DialogContent`
* `DialogTitle`
* `DialogDescription`
* `DialogHeader`
* `DialogFooter`
* `DialogOverlay`
* `DialogPortal`

This makes it easier to create different dialog structures without rewriting the accessibility behavior.

### 3. Tabs behavior is provided by a primitive

My manual Tabs component implements ArrowLeft, ArrowRight, Home, and End keyboard navigation directly.

The shadcn Tabs implementation uses `@base-ui/react/tabs` and exposes reusable components such as `Tabs`, `TabsList`, `TabsTrigger`, and `TabsContent`.

This means the underlying tab interaction and accessibility behavior are handled by the Base UI primitive.

### 4. More complete visual focus states

My manual Tabs implementation mainly focused on keyboard functionality and ARIA relationships.

The shadcn Tabs implementation includes detailed `focus-visible` styles such as borders and focus rings. This provides a clearer visual indication of keyboard focus.

## What I Learned

Building the components manually helped me understand that accessibility is more than adding ARIA attributes.

Interactive components also need correct keyboard behavior, focus management, semantic relationships, and visible focus states.

Using an accessible primitive or component library can reduce the amount of accessibility behavior that needs to be implemented manually, but developers still need to understand that behavior so they can review and use generated components correctly.
