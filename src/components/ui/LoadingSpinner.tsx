
import { ClipLoader } from "react-spinners";

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <ClipLoader color="black" size={50} />
    </div>
  );
};

export default LoadingSpinner;