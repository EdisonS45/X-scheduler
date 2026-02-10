import AnalyticsDaily from '../models/AnalyticsDaily.js';

const today = () => new Date().toISOString().slice(0, 10);

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export const analyticsOverview = async (req, res) => {
  const [todayStats, last7] = await Promise.all([
    AnalyticsDaily.findOne({ userId: req.user.id, date: today() }),
    AnalyticsDaily.aggregate([
      {
        $match: {
          userId: req.user.id,
          date: { $gte: daysAgo(7) },
        },
      },
      {
        $group: {
          _id: null,
          postsScheduled: { $sum: '$postsScheduled' },
          postsPosted: { $sum: '$postsPosted' },
          postsFailed: { $sum: '$postsFailed' },
        },
      },
    ]),
  ]);

  res.json({
    today: todayStats || {},
    last7Days: last7[0] || {},
  });
};

export const analyticsTimeseries = async (req, res) => {
  const range = req.query.range === '30d' ? 30 : 7;

  const data = await AnalyticsDaily.find({
    userId: req.user.id,
    date: { $gte: daysAgo(range) },
  }).sort('date');

  res.json(data);
};
