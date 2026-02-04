export default function StaticTestPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Static Test Page</h1>
      <p>This is a completely static page with no JavaScript imports.</p>
      <p>If this page loads without errors, the issue is with dynamic components or imports.</p>
    </div>
  );
}
