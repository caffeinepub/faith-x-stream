import { useGetAnalytics } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { TrendingUp, Users, Eye, DollarSign, Film, Tv, Video } from 'lucide-react';

export default function AnalyticsDashboard() {
  const { data: analytics, isLoading } = useGetAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 bg-[#1a0000]" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No analytics data available
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Views',
      value: Number(analytics.totalViews).toLocaleString(),
      icon: Eye,
      color: 'text-blue-500',
    },
    {
      title: 'Premium Users',
      value: Number(analytics.premiumUserCount).toLocaleString(),
      icon: Users,
      color: 'text-secondary',
    },
    {
      title: 'Ad Impressions',
      value: Number(analytics.adImpressions).toLocaleString(),
      icon: TrendingUp,
      color: 'text-green-500',
    },
    {
      title: 'Revenue',
      value: analytics.subscriptionRevenue 
        ? `$${analytics.subscriptionRevenue.toFixed(2)}` 
        : '$0.00',
      icon: DollarSign,
      color: 'text-primary',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="gradient-card border-2 border-primary/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trending Content */}
      {analytics.trendingContent && analytics.trendingContent.length > 0 && (
        <Card className="gradient-card border-2 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Trending Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.trendingContent.map((content) => (
                <div
                  key={content.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-black/60 border border-primary/20"
                >
                  <div className="flex items-center gap-3">
                    {content.category === 'video' && <Film className="h-5 w-5 text-primary" />}
                    {content.category === 'series' && <Tv className="h-5 w-5 text-secondary" />}
                    {content.category === 'clip' && <Video className="h-5 w-5 text-blue-500" />}
                    <div>
                      <h3 className="font-semibold">{content.title}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{content.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{Number(content.viewCount).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">views</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Stats */}
      {analytics.categoryStats && analytics.categoryStats.length > 0 && (
        <Card className="gradient-card border-2 border-primary/30">
          <CardHeader>
            <CardTitle>Content Library Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.categoryStats.map((stat) => {
                const totalViews = analytics.categoryStats.reduce((sum, s) => sum + Number(s.viewCount), 0);
                const percentage = totalViews > 0 ? (Number(stat.viewCount) / totalViews) * 100 : 0;
                
                return (
                  <div key={stat.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{stat.category}</span>
                      <span className="text-sm text-muted-foreground">
                        {Number(stat.viewCount).toLocaleString()} views
                      </span>
                    </div>
                    <div className="w-full bg-black/60 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{percentage.toFixed(1)}% of total views</span>
                      <span>
                        {Number(stat.adImpressions).toLocaleString()} ad impressions • 
                        {Number(stat.premiumViews).toLocaleString()} premium views
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
