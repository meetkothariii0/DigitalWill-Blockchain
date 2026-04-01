import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  const features = [
    {
      icon: "📝",
      title: "Create Your Will",
      description: "Set up your digital will with detailed beneficiary information and asset allocation",
    },
    {
      icon: "💰",
      title: "Secure Assets",
      description: "Lock your ETH securely on the blockchain with built-in security protocols",
    },
    {
      icon: "✨",
      title: "Automatic Transfer",
      description: "Assets automatically transfer to beneficiaries upon verified inactivity",
    },
  ];

  const steps = [
    {
      number: 1,
      title: "Connect Wallet",
      description: "Link your MetaMask wallet to the ChainWill platform",
    },
    {
      number: 2,
      title: "Create Will",
      description: "Add beneficiaries, percentages, and deposit your ETH",
    },
    {
      number: 3,
      title: "Proof of Life",
      description: "Regularly verify your status to prevent accidental transfers",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12"
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Your Digital Will,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600">
                On The Blockchain
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Create a decentralized digital will, assign beneficiaries, and let smart contracts handle your legacy.
              Transparent, secure, and unstoppable.
            </p>
            <div className="flex gap-4">
              <Link
                to="/create"
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition transform hover:scale-105"
              >
                Create Your Will →
              </Link>
              <Link
                to="/my-will"
                className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition"
              >
                View My Will
              </Link>
            </div>
          </div>
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="hidden md:block"
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-1 rounded-lg">
              <div className="bg-slate-900 p-8 rounded text-center">
                <div className="text-6xl mb-4">⛓️</div>
                <p className="text-white font-bold">Blockchain Secured</p>
                <p className="text-gray-400 text-sm mt-2">Ethereum Sepolia Testnet</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-700"
      >
        <h2 className="text-4xl font-bold text-white mb-12 text-center">Why ChainWill?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10 }}
              className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg hover:border-indigo-500 transition"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <h2 className="text-4xl font-bold text-white mb-12 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="p-6 bg-gradient-to-br from-indigo-900 to-slate-900 border-2 border-indigo-500 rounded-lg">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-300">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute right-0 top-12 -mr-4 w-8 h-1 bg-indigo-600"></div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-700">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-indigo-400 mb-2">∞</p>
            <p className="text-gray-400">Wills Created</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-green-400 mb-2">100%</p>
            <p className="text-gray-400">Secure on Blockchain</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-purple-400 mb-2">24/7</p>
            <p className="text-gray-400">Available</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center border-t border-slate-700"
      >
        <h2 className="text-4xl font-bold text-white mb-6">Ready to Secure Your Legacy?</h2>
        <p className="text-xl text-gray-400 mb-8">Start creating your digital will today on Ethereum</p>
        <Link
          to="/create"
          className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg transition transform hover:scale-105"
        >
          Create Will Now
        </Link>
      </motion.div>
    </div>
  );
};

export default Home;
