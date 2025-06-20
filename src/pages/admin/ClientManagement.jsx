import { FaUsers, FaInfoCircle } from 'react-icons/fa';

export default function ClientManagement() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <FaUsers className="text-5xl text-gray-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-200">Client Management Coming Soon</h2>
      <p className="text-gray-400 mt-2 max-w-md">
        This section will allow you to view, edit, and manage all your clients efficiently.
      </p>

      <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
        <FaInfoCircle />
        <span>This feature is under development</span>
      </div>
    </div>
  );
}
