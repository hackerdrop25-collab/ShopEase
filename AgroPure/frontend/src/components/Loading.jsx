const Loading = ({ message = "Loading fresh organic produce..." }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 1.5rem",
        color: "var(--text-muted)",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          border: "4px solid var(--border)",
          borderTop: "4px solid var(--primary)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "1rem",
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <p style={{ fontWeight: 600 }}>{message}</p>
    </div>
  );
};

export default Loading;
