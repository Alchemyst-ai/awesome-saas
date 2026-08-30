"""
Test Suite for Visualizer Module
Purpose: Unit tests for visualization functionality
@version 1.0
"""

import pytest
import pandas as pd
import numpy as np
from pathlib import Path
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'app'))

from visualizer import DataVisualizer


@pytest.fixture
def sample_dataframe():
    """Create a sample dataframe for testing"""
    np.random.seed(42)
    data = {
        'numeric1': np.random.randn(100),
        'numeric2': np.random.randn(100) * 10 + 50,
        'category': np.random.choice(['A', 'B', 'C'], 100),
        'date': pd.date_range('2024-01-01', periods=100),
        'value': np.random.randint(1, 100, 100)
    }
    return pd.DataFrame(data)


class TestDataVisualizer:
    """Test cases for DataVisualizer class"""
    
    def test_init(self, sample_dataframe, tmp_path):
        """Test visualizer initialization"""
        viz = DataVisualizer(sample_dataframe, str(tmp_path))
        assert viz.df is not None
        assert len(viz.df) == 100
        assert viz.output_dir == tmp_path
        assert viz.output_dir.exists()
    
    def test_create_distribution_histogram(self, sample_dataframe, tmp_path):
        """Test creating histogram distribution"""
        viz = DataVisualizer(sample_dataframe, str(tmp_path))
        chart_path = viz.create_distribution_plot('numeric1', 'histogram')
        
        assert Path(chart_path).exists()
        assert chart_path.endswith('.png')
    
    def test_create_distribution_bar(self, sample_dataframe, tmp_path):
        """Test creating bar chart for categorical data"""
        viz = DataVisualizer(sample_dataframe, str(tmp_path))
        chart_path = viz.create_distribution_plot('category', 'bar')
        
        assert Path(chart_path).exists()
    
    def test_create_distribution_auto(self, sample_dataframe, tmp_path):
        """Test auto-detecting chart type"""
        viz = DataVisualizer(sample_dataframe, str(tmp_path))
        
        # Should create histogram for numeric
        chart1 = viz.create_distribution_plot('numeric1', 'auto')
        assert Path(chart1).exists()
        
        # Should create bar chart for categorical
        chart2 = viz.create_distribution_plot('category', 'auto')
        assert Path(chart2).exists()
    
    def test_correlation_heatmap(self, sample_dataframe, tmp_path):
        """Test creating correlation heatmap"""
        viz = DataVisualizer(sample_dataframe, str(tmp_path))
        chart_path = viz.create_correlation_heatmap()
        
        assert Path(chart_path).exists()
        assert 'heatmap' in chart_path
    
    def test_scatter_plot(self, sample_dataframe, tmp_path):
        """Test creating scatter plot"""
        viz = DataVisualizer(sample_dataframe, str(tmp_path))
        chart_path = viz.create_scatter_plot('numeric1', 'numeric2')
        
        assert Path(chart_path).exists()
        assert 'scatter' in chart_path
    
    def test_scatter_plot_with_hue(self, sample_dataframe, tmp_path):
        """Test creating scatter plot with color coding"""
        viz = DataVisualizer(sample_dataframe, str(tmp_path))
        chart_path = viz.create_scatter_plot('numeric1', 'numeric2', 'category')
        
        assert Path(chart_path).exists()
    
    def test_time_series_plot(self, sample_dataframe, tmp_path):
        """Test creating time series plot"""
        viz = DataVisualizer(sample_dataframe, str(tmp_path))
        chart_path = viz.create_time_series_plot('date', 'value')
        
        assert Path(chart_path).exists()
        assert 'timeseries' in chart_path
    
    def test_interactive_plot_scatter(self, sample_dataframe, tmp_path):
        """Test creating interactive scatter plot"""
        viz = DataVisualizer(sample_dataframe, str(tmp_path))
        chart_path = viz.create_interactive_plot(
            'scatter',
            x='numeric1',
            y='numeric2',
            title='Test Scatter'
        )
        
        assert Path(chart_path).exists()
        assert chart_path.endswith('.html')
    
    def test_auto_visualize(self, sample_dataframe, tmp_path):
        """Test automatic visualization generation"""
        viz = DataVisualizer(sample_dataframe, str(tmp_path))
        chart_paths = viz.auto_visualize(max_charts=5)
        
        assert len(chart_paths) > 0
        assert len(chart_paths) <= 5
        assert all(Path(p).exists() for p in chart_paths)
    
    def test_charts_summary(self, sample_dataframe, tmp_path):
        """Test getting charts summary"""
        viz = DataVisualizer(sample_dataframe, str(tmp_path))
        viz.auto_visualize(max_charts=3)
        
        summary = viz.get_charts_summary()
        assert 'total_charts' in summary
        assert 'output_directory' in summary
        assert 'chart_paths' in summary
        assert summary['total_charts'] >= 0
    
    def test_invalid_column(self, sample_dataframe, tmp_path):
        """Test handling invalid column name"""
        viz = DataVisualizer(sample_dataframe, str(tmp_path))
        
        with pytest.raises(Exception):
            viz.create_distribution_plot('nonexistent_column')
    
    def test_no_numeric_columns_heatmap(self, tmp_path):
        """Test correlation heatmap with no numeric columns"""
        df = pd.DataFrame({
            'cat1': ['A', 'B', 'C'],
            'cat2': ['X', 'Y', 'Z']
        })
        viz = DataVisualizer(df, str(tmp_path))
        
        with pytest.raises(Exception):
            viz.create_correlation_heatmap()


if __name__ == '__main__':
    pytest.main([__file__, '-v'])

