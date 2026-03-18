import Skeleton from "./Skeleton";

export default function LoadingPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "40px 0",
        maxWidth: "600px",
      }}
    >
      <Skeleton width="180px" height="28px" />
      <Skeleton height="16px" />
      <Skeleton width="90%" height="16px" />
      <Skeleton width="60%" height="16px" />
      <div style={{ height: "20px" }} />
      <Skeleton height="200px" borderRadius="12px" />
    </div>
  );
}
