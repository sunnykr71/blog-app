import {Loader2} from "lucide-react";

function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 size={40} className="animate-spin text-primary" />
    </div>
  );
}

export default Loading;
