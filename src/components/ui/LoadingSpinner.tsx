
import { ClipLoader } from "react-spinners";

const LoadingSpinner = () => {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-background px-4 py-6 sm:px-6 sm:py-8">
      <ClipLoader color="#a287f4" size={40} />
    </div>
  );
};

export default LoadingSpinner;