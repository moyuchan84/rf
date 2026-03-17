import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  CREATE_STREAM_INFO,
  GET_STREAM_INFO_BY_REQUEST
} from '../../api/requestQueries';
import { ArrayInput } from './shared/ArrayInput';

interface StreamInfoFormProps {
  request: any;
  onSave: () => void;
}

export const StreamInfoForm: React.FC<StreamInfoFormProps> = ({ request, onSave }) => {
  const [streamPath, setStreamPath] = useState('');
  const [inputs, setInputs] = useState<string[]>([]);
  const [outputs, setOutputs] = useState<string[]>([]);
  const [newInput, setNewInput] = useState('');
  const [newOutput, setNewOutput] = useState('');

  const { data: existingData } = useQuery(GET_STREAM_INFO_BY_REQUEST, {
    variables: { requestId: request.id }
  });

  useEffect(() => {
    if (existingData?.streamInfoByRequest?.[0]) {
      const si = existingData.streamInfoByRequest[0];
      setStreamPath(si.streamPath);
      setInputs(si.streamInput);
      setOutputs(si.streamOutput);
    }
  }, [existingData]);

  const [createStreamInfo] = useMutation(CREATE_STREAM_INFO);

  const handleFinalSave = async () => {
    await createStreamInfo({
      variables: {
        input: {
          requestId: request.id,
          productId: request.productId,
          processPlanId: 0,
          beolOptionId: 0,
          streamPath,
          streamInput: inputs,
          streamOutput: outputs
        }
      }
    });
    toast.success("Stream info saved");
    onSave();
  };

  return (
    <div className="space-y-6 p-6 border border-slate-200 dark:border-slate-800 rounded-md bg-slate-50/30 dark:bg-slate-950/20">
      <div className="flex items-center gap-3 mb-4">
        <PlayCircle className="w-4 h-4 text-blue-500" />
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Stream Information</h4>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[8px] font-black uppercase text-slate-500 ml-1">Stream Path</label>
          <input 
            value={streamPath}
            onChange={(e) => setStreamPath(e.target.value)}
            className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-bold"
            placeholder="/data/stream/path/..."
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <ArrayInput label="Inputs" items={inputs} setItems={setInputs} newVal={newInput} setNewVal={setNewInput} />
          <ArrayInput label="Outputs" items={outputs} setItems={setOutputs} newVal={newOutput} setNewVal={setNewOutput} />
        </div>
      </div>

      <button 
        onClick={handleFinalSave}
        className="w-full py-3 bg-blue-600 text-white rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md active:scale-[0.98]"
      >
        Save Stream Info
      </button>
    </div>
  );
};
