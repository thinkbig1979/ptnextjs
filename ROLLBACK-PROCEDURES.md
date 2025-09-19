# Emergency Rollback Procedures

Quick reference guide for rolling back Platform Vision Expansion features in case of deployment issues.

## 🚨 Emergency Rollback (Under 5 minutes)

### Option 1: Automated Rollback Script
```bash
# Rollback to last stable release
./scripts/rollback.sh stable

# Or rollback to specific commit
./scripts/rollback.sh commit abc123
```

### Option 2: Manual Git Rollback
```bash
# 1. Find last stable commit
git log --oneline main

# 2. Create backup
git stash push -m "Emergency backup $(date)"

# 3. Rollback to stable
git checkout main
git pull origin main

# 4. Rebuild
npm ci && npm run build
```

### Option 3: Branch Switch
```bash
# Switch back to main branch
git checkout main
git pull origin main
npm ci
npm run build
```

## 🔍 Quick Verification

After rollback, verify these critical functions work:

```bash
# Run verification script
./scripts/verify-deployment.sh

# Manual checks:
# ✅ Homepage loads (/)
# ✅ Vendor list works (/vendors)
# ✅ Product list works (/products)
# ✅ Partner list works (/partners)
# ✅ Individual pages load
```

## 🎯 Rollback Scenarios

### Scenario 1: Build Failure
**Issue**: `npm run build` fails
**Solution**:
```bash
git checkout main
npm ci
npm run build
```

### Scenario 2: Runtime Errors
**Issue**: Pages load but JavaScript errors occur
**Solution**:
```bash
# Clear all caches and rebuild
rm -rf .next out node_modules
npm ci
npm run build
```

### Scenario 3: Performance Issues
**Issue**: Pages load slowly or timeout
**Solution**:
```bash
# Rollback to last stable
./scripts/rollback.sh stable

# Check performance
npm run build:analyze
```

### Scenario 4: Content Issues
**Issue**: CMS content not displaying correctly
**Solution**:
```bash
# Clear TinaCMS cache
rm -rf .tina/__generated__

# Rebuild with fresh content
npm run tina:build
npm run build
```

## 📱 Communication Template

**For team notification during rollback:**

```
🚨 ROLLBACK IN PROGRESS

Issue: [Brief description]
Action: Rolling back platform-vision-expansion to stable
ETA: 5 minutes
Status: [In Progress/Completed]

Verification:
- [ ] Homepage loading
- [ ] Core features working
- [ ] Performance acceptable

Contact: [Your contact info]
```

## 🔧 Rollback Verification Checklist

After rollback completion:

### Technical Verification
- [ ] Build completes successfully
- [ ] TypeScript compilation passes
- [ ] No console errors in browser
- [ ] All core pages load within 3 seconds

### Feature Verification
- [ ] Vendor directory works
- [ ] Product catalog loads
- [ ] Partner profiles accessible
- [ ] Search functionality works
- [ ] Contact forms submit

### Performance Verification
- [ ] Homepage loads < 2 seconds
- [ ] First Contentful Paint < 1.5s
- [ ] No JavaScript errors
- [ ] Mobile responsiveness works

## 📋 Common Issues & Solutions

### Issue: "Module not found" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: TinaCMS schema errors
```bash
# Reset TinaCMS configuration
rm -rf .tina/__generated__
npm run tina:build
```

### Issue: Build succeeds but pages don't load
```bash
# Check Next.js configuration
# Verify next.config.js has correct settings
# Check for missing environment variables
```

### Issue: Performance regression
```bash
# Analyze bundle size
npm run build:analyze

# Check for large dependencies
npm ls --depth=0 | grep -E '\d+\.\d+ MB'
```

## 🎯 Prevention Measures

To avoid needing rollbacks:

1. **Always test locally** before deploying
2. **Run verification script** before deployment
3. **Monitor performance metrics** after deployment
4. **Keep deployment logs** for troubleshooting
5. **Document any configuration changes**

## 📞 Escalation Contacts

- **Technical Lead**: [Contact info]
- **DevOps Team**: [Contact info]
- **Product Owner**: [Contact info]
- **On-call Engineer**: [Contact info]

---

⚡ **Remember**: Speed is critical during rollbacks. Use scripts when possible and verify functionality immediately after rollback completion.