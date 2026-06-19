import React, { useState, useEffect, useMemo } from 'react';
import { Star, Gift, IndianRupee, TrendingUp, Award, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const STORAGE_KEY = 'sana_loyalty_points';
const REWARD_STEP = 100;

const getDefaultData = () => ({
  totalSpent: 0,
  currentPoints: 0,
  redeemedPoints: 0,
  history: [],
});

const loadData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    const parsed = JSON.parse(raw);
    return {
      totalSpent: parsed.totalSpent ?? 0,
      currentPoints: parsed.currentPoints ?? 0,
      redeemedPoints: parsed.redeemedPoints ?? 0,
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return getDefaultData();
  }
};

const LoyaltyPoints = ({ patientId }) => {
  const { t } = useLanguage();
  const [data, setData] = useState(loadData);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(false);

  useEffect(() => {
    const handleStorage = () => setData(loadData());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const { totalSpent, currentPoints, redeemedPoints, history } = data;

  const rewardSlots = useMemo(() => Math.floor(currentPoints / REWARD_STEP), [currentPoints]);
  const rewardAmount = useMemo(() => rewardSlots * 10, [rewardSlots]);

  const nextMilestone = useMemo(
    () => (Math.floor(currentPoints / REWARD_STEP) + 1) * REWARD_STEP,
    [currentPoints],
  );
  const progressInBlock = useMemo(() => currentPoints % REWARD_STEP, [currentPoints]);
  const progressPercent = useMemo(
    () => (progressInBlock / REWARD_STEP) * 100,
    [progressInBlock],
  );

  const handleRedeem = () => {
    setRedeeming(true);
    setTimeout(() => {
      const redeemPoints = rewardSlots * REWARD_STEP;
      const newData = {
        ...data,
        currentPoints: currentPoints - redeemPoints,
        redeemedPoints: redeemedPoints + redeemPoints,
        history: [
          ...history,
          {
            date: new Date().toISOString().split('T')[0],
            type: 'redeemed',
            points: redeemPoints,
            amount: rewardAmount,
          },
        ],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      setData(newData);
      setRedeeming(false);
      setRedeemed(true);
      setTimeout(() => setRedeemed(false), 3000);
    }, 1500);
  };

  const empty = currentPoints === 0 && totalSpent === 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-5 relative overflow-hidden">
        <div className="absolute top-2 right-2 text-purple-500/20">
          <Star className="w-24 h-24" />
        </div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl p-2 backdrop-blur-sm">
              <Star className="w-7 h-7 text-yellow-300 fill-yellow-300" />
            </div>
            <div>
              <h2 className="text-white text-lg font-bold tracking-tight">
                {t('loyaltyTitle')}
              </h2>
              <p className="text-purple-200 text-xs font-medium">
                {t('loyaltySubtitle')}
              </p>
            </div>
          </div>
          <Gift className="w-6 h-6 text-purple-300/80" />
        </div>
      </div>

      <div className="px-6 pt-6 pb-4">
        <div className="text-center mb-4">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
            {t('loyaltyBalance')}
          </p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <Award className={`w-6 h-6 ${empty ? 'text-gray-300' : 'text-yellow-500'}`} />
            <span className="text-4xl font-black text-gray-900">
              {currentPoints}
            </span>
            <span className="text-lg font-bold text-purple-600">
              {t('loyaltyPointsLabel')}
            </span>
          </div>
          {empty ? (
            <p className="text-gray-400 text-sm mt-1 font-medium">
              {t('loyaltyEmptyMessage')}
            </p>
          ) : (
            <p className="text-gray-500 text-sm mt-1 font-medium">
              {currentPoints} {t('loyaltyPointsLabel')} = ₹{rewardAmount} {t('loyaltyOffNextBooking')}
            </p>
          )}
        </div>

        {!empty && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5 font-medium">
              <span>
                {t('loyaltyNextReward')} {nextMilestone} {t('loyaltyPointsLabel')}
              </span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {rewardSlots > 0 && !redeemed && (
          <button
            onClick={handleRedeem}
            disabled={redeeming}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold rounded-xl hover:from-purple-700 hover:to-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 shadow-md shadow-purple-600/20"
          >
            {redeeming ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('loyaltyRedeeming')}
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" /> {t('loyaltyRedeemButton')} — ₹{rewardAmount} {t('loyaltyOff')}
              </>
            )}
          </button>
        )}

        {redeemed && (
          <div className="w-full py-3 bg-green-50 text-green-700 font-extrabold rounded-xl text-center border border-green-200 flex items-center justify-center gap-2">
            <span>🎉</span> ₹{rewardAmount} {t('loyaltyRedeemSuccess')}
          </div>
        )}

        {!empty && rewardSlots === 0 && (
          <p className="text-center text-gray-400 text-sm font-medium">
            {t('loyaltyEarnMore')} {REWARD_STEP - currentPoints} {t('loyaltyPointsToRedeem')}
          </p>
        )}
      </div>

      <div className="border-t border-gray-100">
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">
              {t('loyaltyHistory')}
            </h3>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-4">
              <IndianRupee className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm font-medium">
                {t('loyaltyNoHistory')}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {history.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      entry.type === 'earned'
                        ? 'bg-green-100'
                        : 'bg-purple-100'
                    }`}>
                      {entry.type === 'earned' ? (
                        <IndianRupee className="w-4 h-4 text-green-600" />
                      ) : (
                        <Gift className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-700">
                        {entry.type === 'earned'
                          ? `${t('loyaltyEarnedFrom')} ${entry.test || 'booking'}`
                          : t('loyaltyRedeemedLabel')}
                      </p>
                      {entry.amount && (
                        <p className="text-xs text-gray-400 font-medium">
                          ₹{entry.amount}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 font-medium">
                        {entry.date}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-extrabold ${
                    entry.type === 'earned' ? 'text-green-600' : 'text-purple-600'
                  }`}>
                    {entry.type === 'earned' ? '+' : '-'}{entry.points}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center font-semibold">
          {t('loyaltyFooter')}
        </p>
      </div>
    </div>
  );
};

export default LoyaltyPoints;
