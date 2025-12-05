// Temporary test file to verify TierDowngradeRequestForm component
import { TierDowngradeRequestForm } from './components/dashboard/TierDowngradeRequestForm';

// Test that the component can be imported and has correct props
const TestComponent = () => {
  return (
    <TierDowngradeRequestForm
      vendorId="test-id"
      currentTier="tier3"
      onSuccess={() => console.log('Success')}
      onCancel={() => console.log('Cancel')}
    />
  );
};

export default TestComponent;
