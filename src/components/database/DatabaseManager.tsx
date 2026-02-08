import { useState } from 'react';
import Modal from '../shared/Modal';
import SensorEditor from './SensorEditor';
import LensEditor from './LensEditor';
import TargetEditor from './TargetEditor';
import ImportExport from './ImportExport';

interface DatabaseManagerProps {
  open: boolean;
  onClose: () => void;
}

type Tab = 'sensors' | 'lenses' | 'targets' | 'importexport';

const tabs: { key: Tab; label: string }[] = [
  { key: 'sensors', label: 'Sensors' },
  { key: 'lenses', label: 'Lenses' },
  { key: 'targets', label: 'Targets' },
  { key: 'importexport', label: 'Import/Export' },
];

export default function DatabaseManager({ open, onClose }: DatabaseManagerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('sensors');

  return (
    <Modal open={open} onClose={onClose} title="Database Manager">
      <div className="flex gap-2 mb-4 border-b border-border pb-3">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              activeTab === t.key
                ? 'bg-cyan/15 text-cyan border border-cyan/30'
                : 'text-text-muted hover:text-text-secondary border border-transparent'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {activeTab === 'sensors' && <SensorEditor />}
      {activeTab === 'lenses' && <LensEditor />}
      {activeTab === 'targets' && <TargetEditor />}
      {activeTab === 'importexport' && <ImportExport />}
    </Modal>
  );
}
