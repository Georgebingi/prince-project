# Optimistic UI Updates Implementation Plan

## Phase 1: Enhance Existing useCases.ts Hooks

- [x] Add optimistic updates to useAssignLawyer hook
- [x] Add optimistic updates to useScheduleHearing hook
- [x] Add optimistic updates to useRequestCaseAssignment hook

## Phase 2: Create New Hooks for Documents

- [x] Add document query keys to queryClient.ts
- [x] Create useDocuments hook for fetching documents
- [x] Create useUploadDocument hook with optimistic update
- [x] Create useDeleteDocument hook with optimistic update

## Phase 3: Create New Hooks for Motions

- [x] Add motion query keys to queryClient.ts
- [x] Create useMotions hook for fetching motions
- [x] Create useCreateMotion hook with optimistic update
- [x] Create useUpdateMotionStatus hook with optimistic update

## Phase 4: Create New Hooks for Orders

- [x] Add order query keys to queryClient.ts
- [x] Create useOrders hook for fetching orders
- [x] Create useCreateOrder hook with optimistic update
- [x] Create useSignOrder hook with optimistic update

## Phase 5: Create New Hooks for Notifications

- [x] Add notification query keys to queryClient.ts
- [x] Create useNotifications hook for fetching notifications
- [x] Create useMarkNotificationAsRead hook with optimistic update
- [x] Create useMarkAllNotificationsAsRead hook with optimistic update
- [x] Create useDeleteNotification hook with optimistic update

## Phase 6: Update Components to Use New Hooks

- [x] Update CaseDetailPage.tsx to use useUploadDocument (import added)
- [x] Update motion/order components to use new hooks
- [x] Update notification components to use new hooks
