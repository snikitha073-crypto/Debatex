import React, { useState } from 'react';
import {
  Compass,
  Search,
  Swords,
  BookOpen,
  Laptop,
  Heart,
  Utensils,
  Leaf,
  Check,
} from 'lucide-react';
import { Topic, TopicCategory } from '../../types/debate';

interface TopicsViewProps {
  topics: Topic[];
  onStartDebateWithTopic: (topicId: string, preferredSide?: string) => void;
}

const CATEGORIES: Array<'All' | TopicCategory> = [
  'All',
  'Education',
  'Technology',
  'Lifestyle',
  'Food',
  'Environment',
];

export const TopicsView: React.FC<TopicsViewProps> = ({
  topics,
  onStartDebateWithTopic,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | TopicCategory>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const getCategoryIcon = (cat: TopicCategory) => {
    switch (cat) {
      case 'Education':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'Technology':
        return <Laptop className="w-3.5 h-3.5" />;
      case 'Lifestyle':
        return <Heart className="w-3.5 h-3.5" />;
      case 'Food':
        return <Utensils className="w-3.5 h-3.5" />;
      case 'Environment':
        return <Leaf className="w-3.5 h-3.5" />;
    }
  };

  const filteredTopics = topics.filter((topic) => {
    const matchesCategory =
      selectedCategory === 'All' || topic.category === selectedCategory;
    const matchesDifficulty =
      difficultyFilter === 'All' || topic.difficulty === difficultyFilter;
    const matchesQuery =
      searchQuery.trim() === '' ||
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesDifficulty && matchesQuery;
  });

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Debate Topics
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Pick a fun and relatable topic from everyday life. Choose which side you believe in and debate an AI opponent!
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search topics (e.g. Books, Coffee, AI)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#090e21] border border-[#1b254a] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Category Pills & Difficulty Filter */}
      <div className="space-y-3">
        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#d946ef] to-[#06b6d4] text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                  : 'bg-[#090e21] text-slate-400 hover:text-white border border-[#1b254a] hover:border-[#2f3e75]'
              }`}
            >
              {cat !== 'All' && getCategoryIcon(cat)}
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <div className="flex items-center gap-2">
            <span>Difficulty:</span>
            <div className="flex items-center gap-1.5">
              {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    difficultyFilter === diff
                      ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200 bg-[#0c1228] border border-[#1c274d]'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <span className="font-mono text-slate-500">
            {filteredTopics.length} topics available
          </span>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTopics.map((topic) => (
          <div
            key={topic.id}
            className="group rounded-2xl bg-[#090e21] border border-[#1b254a] hover:border-cyan-400/50 p-5 transition-all duration-200 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Category & Difficulty */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-purple-400 flex items-center gap-1.5">
                  {getCategoryIcon(topic.category)}
                  {topic.category}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                    topic.difficulty === 'Beginner'
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                      : topic.difficulty === 'Intermediate'
                      ? 'bg-sky-950/60 text-sky-300 border border-sky-500/30'
                      : 'bg-purple-950/60 text-purple-300 border border-purple-500/30'
                  }`}
                >
                  {topic.difficulty}
                </span>
              </div>

              {/* Title & Question */}
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                  {topic.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 font-medium italic">
                  "{topic.question}"
                </p>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {topic.description}
              </p>
            </div>

            {/* Choose Which Side To Defend */}
            <div className="space-y-2 pt-2 border-t border-[#192348]">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Choose which side you want to defend:
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onStartDebateWithTopic(topic.id, topic.sideA)}
                  className="p-2.5 rounded-xl bg-[#0e1633] hover:bg-purple-900/40 text-slate-200 hover:text-white border border-[#22305e] hover:border-purple-400 text-xs font-semibold transition-all text-center leading-snug cursor-pointer"
                >
                  {topic.sideA}
                </button>

                <button
                  onClick={() => onStartDebateWithTopic(topic.id, topic.sideB)}
                  className="p-2.5 rounded-xl bg-[#0e1633] hover:bg-cyan-900/40 text-slate-200 hover:text-white border border-[#22305e] hover:border-cyan-400 text-xs font-semibold transition-all text-center leading-snug cursor-pointer"
                >
                  {topic.sideB}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
