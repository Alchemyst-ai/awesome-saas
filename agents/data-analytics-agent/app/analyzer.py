"""
Data Analyzer Module
Purpose: Core analytics engine for data loading and statistical analysis
Features:
- Multi-format data loading (CSV, JSON, Excel)
- Statistical analysis and calculations
- Outlier detection and missing value analysis
- Correlation matrix computation
@version 1.0
@package data-analytics-agent
@author iamtensaiii
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path
import json
from scipy import stats


class DataAnalyzer:
    """
    DataAnalyzer
    Purpose: Load and analyze data from various formats
    @property DataFrame df: Loaded dataframe
    @property dict metadata: Dataset metadata
    """
    
    def __init__(self):
        """
        Initialize Data Analyzer
        """
        self.df: Optional[pd.DataFrame] = None
        self.metadata: Dict[str, Any] = {}
        self.analysis_results: Dict[str, Any] = {}
    
    def load_data(self, file_path: str) -> pd.DataFrame:
        """
        Load data from CSV, JSON, or Excel file
        @param str file_path: Path to data file
        @return DataFrame: Loaded pandas dataframe
        @throws ValueError: When file format is unsupported
        @throws FileNotFoundError: When file doesn't exist
        """
        try:
            file_path = Path(file_path)
            
            if not file_path.exists():
                raise FileNotFoundError(f"File not found: {file_path}")
            
            # Determine file type and load accordingly
            extension = file_path.suffix.lower()
            
            if extension == '.csv':
                self.df = pd.read_csv(file_path)
            elif extension == '.json':
                self.df = pd.read_json(file_path)
            elif extension in ['.xlsx', '.xls']:
                self.df = pd.read_excel(file_path)
            else:
                raise ValueError(
                    f"Unsupported file format: {extension}. "
                    "Supported: .csv, .json, .xlsx, .xls"
                )
            
            # Store metadata
            self.metadata = {
                'file_path': str(file_path),
                'file_name': file_path.name,
                'file_type': extension[1:],
                'rows': len(self.df),
                'columns': len(self.df.columns),
                'column_names': self.df.columns.tolist(),
                'dtypes': self.df.dtypes.astype(str).to_dict()
            }
            
            return self.df
            
        except Exception as e:
            raise Exception(f"Error loading data: {str(e)}")
    
    def get_basic_stats(self) -> Dict[str, Any]:
        """
        Calculate basic statistical measures
        @return dict: Dictionary containing basic statistics
        @throws Exception: When dataframe is not loaded
        """
        try:
            if self.df is None:
                raise Exception("No data loaded. Call load_data() first.")
            
            stats_dict = {
                'shape': {
                    'rows': int(self.df.shape[0]),
                    'columns': int(self.df.shape[1])
                },
                'columns': self.df.columns.tolist(),
                'dtypes': self.df.dtypes.astype(str).to_dict(),
                'missing_values': self.df.isnull().sum().to_dict(),
                'missing_percentage': (self.df.isnull().sum() / len(self.df) * 100).round(2).to_dict(),
                'numeric_columns': self.df.select_dtypes(include=[np.number]).columns.tolist(),
                'categorical_columns': self.df.select_dtypes(include=['object']).columns.tolist(),
                'datetime_columns': self.df.select_dtypes(include=['datetime64']).columns.tolist()
            }
            
            # Add statistical summary for numeric columns
            if len(stats_dict['numeric_columns']) > 0:
                stats_dict['statistical_summary'] = self.df.describe().to_dict()
            
            # Add value counts for categorical columns (top 10)
            categorical_summary = {}
            for col in stats_dict['categorical_columns']:
                value_counts = self.df[col].value_counts().head(10).to_dict()
                categorical_summary[col] = {
                    'unique_count': int(self.df[col].nunique()),
                    'top_values': value_counts
                }
            stats_dict['categorical_summary'] = categorical_summary
            
            self.analysis_results['basic_stats'] = stats_dict
            return stats_dict
            
        except Exception as e:
            raise Exception(f"Error calculating basic stats: {str(e)}")
    
    def _detect_outliers_iqr(self, col_data: pd.Series) -> Tuple[pd.Series, float, float]:
        """Detect outliers using IQR method"""
        Q1 = col_data.quantile(0.25)
        Q3 = col_data.quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        outliers = self.df[(self.df[col_data.name] < lower_bound) | (self.df[col_data.name] > upper_bound)][col_data.name]
        return outliers, lower_bound, upper_bound
    
    def _detect_outliers_zscore(self, col_data: pd.Series) -> pd.Series:
        """Detect outliers using Z-score method"""
        z_scores = np.abs(stats.zscore(col_data))
        return col_data[z_scores > 3]
    
    def _validate_outlier_inputs(self, column: str) -> pd.Series:
        """Validate inputs for outlier detection"""
        if self.df is None:
            raise Exception("No data loaded")
        
        if column not in self.df.columns:
            raise ValueError(f"Column '{column}' not found")
        
        if not pd.api.types.is_numeric_dtype(self.df[column]):
            raise ValueError(f"Column '{column}' is not numeric")
        
        return self.df[column].dropna()

    def detect_outliers(self, column: str, method: str = 'iqr') -> Dict[str, Any]:
        """
        Detect outliers in numeric column
        @param str column: Column name to analyze
        @param str method: Detection method ('iqr' or 'zscore')
        @return dict: Outlier analysis results
        @throws Exception: When column is not numeric or doesn't exist
        """
        try:
            col_data = self._validate_outlier_inputs(column)
            
            if method == 'iqr':
                outliers, lower_bound, upper_bound = self._detect_outliers_iqr(col_data)
                bounds = {'lower': float(lower_bound), 'upper': float(upper_bound)}
            elif method == 'zscore':
                outliers = self._detect_outliers_zscore(col_data)
                bounds = {'lower': None, 'upper': None}
            else:
                raise ValueError(f"Unknown method: {method}. Use 'iqr' or 'zscore'")
            
            result = {
                'column': column,
                'method': method,
                'total_outliers': int(len(outliers)),
                'outlier_percentage': float(round(len(outliers) / len(col_data) * 100, 2)),
                'outlier_values': outliers.tolist()[:50],  # Limit to first 50
                'bounds': bounds
            }
            
            return result
            
        except Exception as e:
            raise Exception(f"Error detecting outliers: {str(e)}")
    
    def _extract_correlations(self, corr_matrix: pd.DataFrame) -> List[Dict[str, Any]]:
        """Extract correlation pairs from correlation matrix"""
        correlations = []
        for i in range(len(corr_matrix.columns)):
            for j in range(i+1, len(corr_matrix.columns)):
                correlations.append({
                    'column1': corr_matrix.columns[i],
                    'column2': corr_matrix.columns[j],
                    'correlation': float(corr_matrix.iloc[i, j])
                })
        return correlations
    
    def _categorize_correlations(self, correlations: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """Categorize correlations into positive, negative, and strong"""
        # Sort by absolute correlation value
        correlations.sort(key=lambda x: abs(x['correlation']), reverse=True)
        
        return {
            'top_positive_correlations': [c for c in correlations if c['correlation'] > 0][:10],
            'top_negative_correlations': [c for c in correlations if c['correlation'] < 0][:10],
            'strong_correlations': [c for c in correlations if abs(c['correlation']) > 0.7]
        }

    def calculate_correlation_matrix(self, method: str = 'pearson') -> Dict[str, Any]:
        """
        Calculate correlation matrix for numeric columns
        @param str method: Correlation method ('pearson', 'spearman', 'kendall')
        @return dict: Correlation matrix and top correlations
        @throws Exception: When no numeric columns exist
        """
        try:
            if self.df is None:
                raise Exception("No data loaded")
            
            numeric_df = self.df.select_dtypes(include=[np.number])
            
            if numeric_df.empty:
                raise Exception("No numeric columns found in dataset")
            
            # Calculate correlation matrix
            corr_matrix = numeric_df.corr(method=method)
            
            # Extract and categorize correlations
            correlations = self._extract_correlations(corr_matrix)
            categorized = self._categorize_correlations(correlations)
            
            result = {
                'method': method,
                'matrix': corr_matrix.to_dict(),
                **categorized
            }
            
            self.analysis_results['correlation'] = result
            return result
            
        except Exception as e:
            raise Exception(f"Error calculating correlation: {str(e)}")
    
    def analyze_missing_values(self) -> Dict[str, Any]:
        """
        Analyze missing values in dataset
        @return dict: Missing value analysis
        """
        try:
            if self.df is None:
                raise Exception("No data loaded")
            
            missing_counts = self.df.isnull().sum()
            missing_percentages = (missing_counts / len(self.df) * 100).round(2)
            
            # Columns with missing values
            columns_with_missing = missing_counts[missing_counts > 0].to_dict()
            
            # Pattern analysis - rows with missing values
            rows_with_missing = self.df.isnull().any(axis=1).sum()
            
            result = {
                'total_missing_values': int(missing_counts.sum()),
                'columns_with_missing': columns_with_missing,
                'missing_percentages': missing_percentages[missing_percentages > 0].to_dict(),
                'rows_with_missing': int(rows_with_missing),
                'rows_with_missing_percentage': float(round(rows_with_missing / len(self.df) * 100, 2)),
                'complete_rows': int(len(self.df) - rows_with_missing)
            }
            
            return result
            
        except Exception as e:
            raise Exception(f"Error analyzing missing values: {str(e)}")
    
    def detect_time_series(self) -> Optional[Dict[str, Any]]:
        """
        Detect and analyze time series columns
        @return dict: Time series analysis or None if no datetime columns
        """
        try:
            if self.df is None:
                raise Exception("No data loaded")
            
            # Find datetime columns
            datetime_cols = self.df.select_dtypes(include=['datetime64']).columns.tolist()
            
            # Try to convert object columns to datetime
            for col in self.df.select_dtypes(include=['object']).columns:
                try:
                    self.df[col] = pd.to_datetime(self.df[col])
                    datetime_cols.append(col)
                except (ValueError, TypeError) as e:
                    # Column is not a datetime format, skip it
                    print(f"Info: Column '{col}' is not a datetime format: {e}")
            
            if not datetime_cols:
                return None
            
            result = {
                'datetime_columns': datetime_cols,
                'analysis': {}
            }
            
            for col in datetime_cols:
                col_data = self.df[col].dropna()
                result['analysis'][col] = {
                    'min_date': str(col_data.min()),
                    'max_date': str(col_data.max()),
                    'date_range_days': int((col_data.max() - col_data.min()).days),
                    'unique_dates': int(col_data.nunique())
                }
            
            return result
            
        except Exception as e:
            return None
    
    def get_column_summary(self, column: str) -> Dict[str, Any]:
        """
        Get detailed summary for specific column
        @param str column: Column name
        @return dict: Column summary
        @throws ValueError: When column doesn't exist
        """
        try:
            if self.df is None:
                raise Exception("No data loaded")
            
            if column not in self.df.columns:
                raise ValueError(f"Column '{column}' not found")
            
            col_data = self.df[column]
            summary = {
                'column_name': column,
                'dtype': str(col_data.dtype),
                'total_values': int(len(col_data)),
                'missing_values': int(col_data.isnull().sum()),
                'missing_percentage': float(round(col_data.isnull().sum() / len(col_data) * 100, 2)),
                'unique_values': int(col_data.nunique())
            }
            
            # Numeric column stats
            if pd.api.types.is_numeric_dtype(col_data):
                summary.update({
                    'mean': float(col_data.mean()),
                    'median': float(col_data.median()),
                    'std': float(col_data.std()),
                    'min': float(col_data.min()),
                    'max': float(col_data.max()),
                    'q25': float(col_data.quantile(0.25)),
                    'q75': float(col_data.quantile(0.75))
                })
            
            # Categorical column stats
            else:
                value_counts = col_data.value_counts().head(20).to_dict()
                summary.update({
                    'top_values': value_counts,
                    'most_common': str(col_data.mode()[0]) if len(col_data.mode()) > 0 else None
                })
            
            return summary
            
        except Exception as e:
            raise Exception(f"Error getting column summary: {str(e)}")
    
    def export_analysis(self, output_path: str) -> None:
        """
        Export analysis results to JSON file
        @param str output_path: Path to save results
        @throws Exception: When export fails
        """
        try:
            results = {
                'metadata': self.metadata,
                'analysis': self.analysis_results
            }
            
            with open(output_path, 'w') as f:
                json.dump(results, f, indent=2)
            
            print(f"Analysis exported to: {output_path}")
            
        except Exception as e:
            raise Exception(f"Error exporting analysis: {str(e)}")

