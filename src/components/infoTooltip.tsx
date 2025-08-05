'use client';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Info } from 'lucide-react';

export default function InfoTooltip({ content }: { content: string }) {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span className="ml-1 text-blue-600 cursor-pointer">
            <Info size={16} />
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            className="z-50 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg"
            sideOffset={5}
          >
            {content}
            <Tooltip.Arrow className="fill-gray-800" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
