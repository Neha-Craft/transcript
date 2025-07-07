import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { TenantId } from '../reduxtoolkit/reducer/encounterSlice';
import { useRouter } from 'next/navigation';

export default function DateEncounter({ encounters, isToday, formatDate }) {
  const [selectedIndex, setSelectedIndex] = useState(0); // default to null
  const router = useRouter();
  const dispatch = useDispatch();

  const nameChange = useSelector((state) => state?.encounter?.title);
  const IdChange = useSelector((state) => state?.encounter?.idNumber);

  const handleIdclick = (id, index) => {
    setSelectedIndex(index);
    router.push(`/encounter/${id}`);
    dispatch(TenantId(id));
  };

  return (
    <div>
      <div>
        {encounters.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-4">
            <div className="px-4 ">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide font-aeonik px-2">
                {isToday(group?.created_at) ? 'TODAY' : formatDate(group?.created_at)}
              </h3>
            </div>

            <div className="px-4 mb-1">
              <div
                className={`flex items-center justify-between p-2 rounded-md group cursor-pointer ${
                  selectedIndex === groupIndex ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
                onClick={() => handleIdclick(group?.uuid, groupIndex)}
              >
                <div>
                  <div className="text-sm text-gray-900 font-aeonik cursor-pointer">
                    {group?.uuid === IdChange ? nameChange || group?.title : group?.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {group?.status} • {group?.duration} min
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded">
                  <Trash2 className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
