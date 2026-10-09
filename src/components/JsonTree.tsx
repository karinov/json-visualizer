import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown, Copy, Check, Hash, Type, ToggleLeft, Ban, Box, List, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface JsonNodeProps {
  name?: string;
  value: any;
  isLast?: boolean; // Kept for compatibility but unused visually
  level?: number;
  initiallyExpanded?: boolean;
  expandSignal?: number;
  collapseSignal?: number;
}

const getType = (value: any) => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Date) return 'date';
  return typeof value;
};

export const JsonNode: React.FC<JsonNodeProps> = ({ 
  name, 
  value, 
  level = 0,
  initiallyExpanded,
  expandSignal = 0,
  collapseSignal = 0
}) => {
  const [expanded, setExpanded] = useState(initiallyExpanded !== undefined ? initiallyExpanded : level < 1);
  const [copied, setCopied] = useState(false);

  const isFirstMountExpand = useRef(true);
  useEffect(() => {
    if (isFirstMountExpand.current) {
      isFirstMountExpand.current = false;
      return;
    }
    if (expandSignal > 0) setExpanded(true);
  }, [expandSignal]);

  const isFirstMountCollapse = useRef(true);
  useEffect(() => {
    if (isFirstMountCollapse.current) {
      isFirstMountCollapse.current = false;
      return;
    }
    if (collapseSignal > 0) setExpanded(false);
  }, [collapseSignal]);

  const type = getType(value);
  const isObject = type === 'object' || type === 'array';
  const isEmpty = isObject && Object.keys(value).length === 0;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(value, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEmpty) setExpanded(!expanded);
  };

  const renderValue = (val: any) => {
    const valType = getType(val);
    switch (valType) {
      case 'string':
        return (
          <div className="flex items-center gap-2 text-slate-700 break-all bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
            <Type size={12} className="text-slate-400 shrink-0" />
            <span>{val}</span>
          </div>
        );
      case 'number':
        return (
          <div className="flex items-center gap-2 text-blue-700 font-mono bg-blue-50 px-2 py-1 rounded border border-blue-100 shadow-sm">
            <Hash size={12} className="text-blue-400 shrink-0" />
            <span>{val}</span>
          </div>
        );
      case 'boolean':
        return (
          <div className={cn(
            "flex items-center gap-2 px-2 py-1 rounded border shadow-sm font-medium text-xs uppercase tracking-wider",
            val ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
          )}>
            <ToggleLeft size={12} className={val ? "text-emerald-500" : "text-rose-500"} />
            <span>{val.toString()}</span>
          </div>
        );
      case 'null':
        return (
          <div className="flex items-center gap-2 text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200 shadow-sm text-xs font-medium uppercase tracking-wider">
            <Ban size={12} className="text-slate-400" />
            <span>NULL</span>
          </div>
        );
      default:
        return <span className="text-slate-800">{String(val)}</span>;
    }
  };

  // Primitive Types
  if (!isObject) {
    return (
      <div className="group flex items-start py-1.5">
        <div className="flex-1 flex items-center flex-wrap gap-2">
          {name && (
            <span className="font-medium text-slate-600 text-sm min-w-[4rem]">{name}</span>
          )}
          {renderValue(value)}
        </div>
        
        <button 
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
          title="Copy value"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
    );
  }

  // Complex Types (Object/Array)
  const keys = Object.keys(value);
  const itemCount = type === 'array' ? value.length : keys.length;
  const TypeIcon = type === 'array' ? List : Box;

  return (
    <div className="my-2">
      <div 
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors border select-none group",
          expanded ? "bg-slate-50 border-slate-200" : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm"
        )}
        onClick={toggleExpand}
      >
        <div className={cn(
          "p-1 rounded-md transition-colors",
          expanded ? "bg-slate-200 text-slate-600" : "bg-indigo-50 text-indigo-600"
        )}>
           {isEmpty ? <div className="w-4 h-4" /> : (expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
        </div>

        <div className="flex items-center gap-2 flex-1">
          {name && <span className="font-semibold text-slate-700">{name}</span>}
          
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium border border-slate-200">
            <TypeIcon size={12} />
            <span>{type === 'array' ? 'List' : 'Object'}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 mx-0.5" />
            <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
          </div>
        </div>

        <button 
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
          title="Copy object"
        >
           {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && !isEmpty && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pl-4 ml-3.5 border-l-2 border-slate-100 py-1 space-y-1">
              {keys.map((key, index) => (
                <JsonNode
                  key={key}
                  name={type === 'array' ? undefined : key}
                  value={value[key as keyof typeof value]}
                  level={level + 1}
                  expandSignal={expandSignal}
                  collapseSignal={collapseSignal}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
