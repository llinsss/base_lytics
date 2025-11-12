# 🔔 BaseLytics Notifications System Guide

Real-time toast notifications for enhanced user experience across all contract interactions.

## 🚀 Features

### Notification Types
- **Success** ✅ - Transaction completed successfully
- **Error** ❌ - Transaction failed or error occurred
- **Warning** ⚠️ - Important information or pending states
- **Info** ℹ️ - General information and updates

### Auto-Transaction Tracking
- **Pending** notifications when transaction is submitted
- **Confirming** notifications during block confirmation
- **Success** notifications with explorer links
- **Error** notifications with detailed error messages

## 📱 User Experience

### Visual Design
- **Slide-in animations** from the right
- **Color-coded** notifications by type
- **Auto-dismiss** after customizable duration
- **Manual close** button on all notifications
- **Fixed positioning** in top-right corner

### Interactive Features
- **Explorer links** for viewing transactions
- **Action buttons** for additional functionality
- **Smooth animations** for show/hide
- **Stack management** for multiple notifications

## 🔧 Implementation

### Automatic Integration
All contract interactions now include:
- **Transaction submission** notifications
- **Confirmation tracking** with progress updates
- **Success/failure** feedback with links
- **Error handling** with user-friendly messages

### Components Enhanced
- **TokenCard** - Transfer notifications
- **NFTCard** - Minting notifications  
- **StakingCard** - Staking operation notifications
- **All contract** interactions include notifications

## 📊 Notification Lifecycle

### Transaction Flow
1. **User initiates** transaction
2. **Pending notification** appears immediately
3. **Confirming notification** shows during block confirmation
4. **Success/Error notification** shows final result
5. **Auto-dismiss** after duration or manual close

### Duration Settings
- **Pending**: Persistent (manual close only)
- **Confirming**: 3 seconds
- **Success**: 5 seconds
- **Error**: 8 seconds (longer for reading)
- **Info**: 5 seconds

## 🎯 Usage Examples

### Success Notifications
```typescript
// Automatic for transactions
useTransactionNotifications(transaction, {
  successTitle: 'Tokens Transferred Successfully',
  onSuccess: () => clearForm()
});

// Manual notifications
addNotification({
  type: 'success',
  title: 'Operation Complete',
  message: 'Your action was successful'
});
```

### Error Handling
```typescript
// Automatic error notifications
useTransactionNotifications(transaction, {
  errorTitle: 'Transfer Failed'
});

// Custom error notifications
addNotification({
  type: 'error',
  title: 'Connection Error',
  message: 'Please check your network connection',
  duration: 8000
});
```

### Action Buttons
```typescript
addNotification({
  type: 'info',
  title: 'Transaction Submitted',
  action: {
    label: 'View on Explorer',
    onClick: () => window.open(explorerUrl, '_blank')
  }
});
```

## 🔧 Customization

### Notification Options
- **Title**: Main notification message
- **Message**: Optional detailed description
- **Duration**: Auto-dismiss time (0 = manual only)
- **Action**: Optional button with custom function
- **Type**: Visual styling and icon

### Styling
- **Responsive design** works on all screen sizes
- **Consistent colors** with Base theme
- **Smooth animations** for professional feel
- **Accessible** with proper ARIA labels

## 📱 Mobile Experience

### Mobile Optimizations
- **Touch-friendly** close buttons
- **Appropriate sizing** for mobile screens
- **Readable text** at mobile sizes
- **Proper positioning** that doesn't block content

### Performance
- **Lightweight animations** for smooth performance
- **Efficient rendering** with React optimization
- **Memory management** with auto-cleanup
- **Minimal bundle** impact

## 🛠️ Developer Usage

### useNotifications Hook
```typescript
const { addNotification, removeNotification, clearAll } = useNotifications();

// Add notification
addNotification({
  type: 'success',
  title: 'Success!',
  message: 'Operation completed'
});

// Remove specific notification
removeNotification(notificationId);

// Clear all notifications
clearAll();
```

### useTransactionNotifications Hook
```typescript
const transaction = useContractWrite();

useTransactionNotifications(transaction, {
  pendingTitle: 'Processing...',
  successTitle: 'Complete!',
  errorTitle: 'Failed',
  onSuccess: () => handleSuccess()
});
```

## 🔍 Troubleshooting

### Common Issues

**Notifications not appearing**
- Check NotificationProvider is wrapping app
- Verify NotificationContainer is rendered
- Check console for JavaScript errors

**Animations not smooth**
- Ensure Tailwind CSS is properly configured
- Check for CSS conflicts
- Verify browser supports CSS transitions

**Explorer links not working**
- Check network configuration
- Verify transaction hash format
- Ensure popup blockers allow new windows

### Performance Tips
- **Limit concurrent** notifications (max 5-6)
- **Use appropriate** durations for content
- **Clear notifications** when navigating pages
- **Test on mobile** devices for performance

## 🚀 Future Enhancements

### Planned Features
- **Sound notifications** for important events
- **Browser notifications** when tab not active
- **Notification history** and replay
- **Custom positioning** options
- **Batch notifications** for multiple operations

### Integration Possibilities
- **WebSocket updates** for real-time events
- **Email notifications** for critical actions
- **Slack/Discord** integration for teams
- **Analytics tracking** for notification engagement

This notification system provides professional-grade user feedback, making your BaseLytics dApp feel responsive and user-friendly across all interactions.