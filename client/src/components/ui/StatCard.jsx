import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

function AnimatedCounter({ value, duration = 1 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Number(value);
    if (start === end) return;

    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <>{typeof value === 'string' ? value : count.toLocaleString('es-MX')}</>;
}

export default function StatCard({ title, value, icon: Icon, color, prefix = '', suffix = '', delay = 0 }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-amber-500 to-amber-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
    indigo: 'from-indigo-500 to-indigo-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="card p-6 cursor-default"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {prefix}
            <AnimatedCounter value={value} />
            {suffix}
          </p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color] || colorClasses.blue} shadow-lg`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </motion.div>
  );
}
