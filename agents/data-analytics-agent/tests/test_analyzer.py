"""
Test Suite for Data Analyzer Module
Purpose: Unit tests for analyzer functionality
@version 1.0
"""

import pytest
import pandas as pd
import numpy as np
from pathlib import Path
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'app'))

from analyzer import DataAnalyzer


@pytest.fixture
def sample_csv(tmp_path):
    """Create a temporary CSV file for testing"""
    data = {
        'name': ['Alice', 'Bob', 'Charlie', 'David', 'Eve'],
        'age': [25, 30, 35, 28, 32],
        'salary': [50000, 60000, 75000, 55000, 70000],
        'department': ['IT', 'HR', 'IT', 'Finance', 'HR']
    }
    df = pd.DataFrame(data)
    csv_path = tmp_path / "test_data.csv"
    df.to_csv(csv_path, index=False)
    return csv_path


@pytest.fixture
def sample_json(tmp_path):
    """Create a temporary JSON file for testing"""
    data = [
        {'id': 1, 'value': 10, 'category': 'A'},
        {'id': 2, 'value': 20, 'category': 'B'},
        {'id': 3, 'value': 30, 'category': 'A'},
    ]
    json_path = tmp_path / "test_data.json"
    pd.DataFrame(data).to_json(json_path, orient='records')
    return json_path


class TestDataAnalyzer:
    """Test cases for DataAnalyzer class"""
    
    def test_init(self):
        """Test analyzer initialization"""
        analyzer = DataAnalyzer()
        assert analyzer.df is None
        assert analyzer.metadata == {}
        assert analyzer.analysis_results == {}
    
    def test_load_csv(self, sample_csv):
        """Test loading CSV file"""
        analyzer = DataAnalyzer()
        df = analyzer.load_data(str(sample_csv))
        
        assert len(df) == 5
        assert len(df.columns) == 4
        assert 'name' in df.columns
        assert 'age' in df.columns
    
    def test_load_json(self, sample_json):
        """Test loading JSON file"""
        analyzer = DataAnalyzer()
        df = analyzer.load_data(str(sample_json))
        
        assert len(df) == 3
        assert 'id' in df.columns
        assert 'value' in df.columns
    
    def test_load_invalid_file(self):
        """Test loading non-existent file"""
        analyzer = DataAnalyzer()
        with pytest.raises(Exception):
            analyzer.load_data("nonexistent.csv")
    
    def test_get_basic_stats(self, sample_csv):
        """Test basic statistics calculation"""
        analyzer = DataAnalyzer()
        analyzer.load_data(str(sample_csv))
        stats = analyzer.get_basic_stats()
        
        assert stats['shape']['rows'] == 5
        assert stats['shape']['columns'] == 4
        assert 'age' in stats['numeric_columns']
        assert 'salary' in stats['numeric_columns']
        assert 'name' in stats['categorical_columns']
        assert 'department' in stats['categorical_columns']
    
    def test_detect_outliers_iqr(self, sample_csv):
        """Test outlier detection with IQR method"""
        analyzer = DataAnalyzer()
        analyzer.load_data(str(sample_csv))
        
        # Add an outlier
        analyzer.df.loc[5] = ['Outlier', 100, 200000, 'IT']
        
        outliers = analyzer.detect_outliers('age', method='iqr')
        assert 'total_outliers' in outliers
        assert outliers['column'] == 'age'
    
    def test_detect_outliers_zscore(self, sample_csv):
        """Test outlier detection with z-score method"""
        analyzer = DataAnalyzer()
        analyzer.load_data(str(sample_csv))
        
        outliers = analyzer.detect_outliers('salary', method='zscore')
        assert 'total_outliers' in outliers
        assert outliers['method'] == 'zscore'
    
    def test_correlation_matrix(self, sample_csv):
        """Test correlation matrix calculation"""
        analyzer = DataAnalyzer()
        analyzer.load_data(str(sample_csv))
        
        corr = analyzer.calculate_correlation_matrix()
        assert 'matrix' in corr
        assert 'method' in corr
        assert corr['method'] == 'pearson'
    
    def test_missing_values_analysis(self, sample_csv):
        """Test missing value analysis"""
        analyzer = DataAnalyzer()
        analyzer.load_data(str(sample_csv))
        
        # Add missing values
        analyzer.df.loc[0, 'age'] = None
        analyzer.df.loc[1, 'salary'] = None
        
        missing = analyzer.analyze_missing_values()
        assert missing['total_missing_values'] == 2
        assert 'age' in missing['columns_with_missing']
    
    def test_column_summary_numeric(self, sample_csv):
        """Test column summary for numeric data"""
        analyzer = DataAnalyzer()
        analyzer.load_data(str(sample_csv))
        
        summary = analyzer.get_column_summary('age')
        assert summary['column_name'] == 'age'
        assert 'mean' in summary
        assert 'median' in summary
        assert 'std' in summary
    
    def test_column_summary_categorical(self, sample_csv):
        """Test column summary for categorical data"""
        analyzer = DataAnalyzer()
        analyzer.load_data(str(sample_csv))
        
        summary = analyzer.get_column_summary('department')
        assert summary['column_name'] == 'department'
        assert 'top_values' in summary
        assert 'unique_values' in summary
    
    def test_export_analysis(self, sample_csv, tmp_path):
        """Test exporting analysis results"""
        analyzer = DataAnalyzer()
        analyzer.load_data(str(sample_csv))
        analyzer.get_basic_stats()
        
        output_path = tmp_path / "analysis.json"
        analyzer.export_analysis(str(output_path))
        
        assert output_path.exists()
        
        import json
        with open(output_path) as f:
            data = json.load(f)
            assert 'metadata' in data
            assert 'analysis' in data


if __name__ == '__main__':
    pytest.main([__file__, '-v'])

