
import { ClipLoader } from "react-spinners";

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <ClipLoader color="#a287f4" size={50} />
    </div>
  );
};

export default LoadingSpinner;