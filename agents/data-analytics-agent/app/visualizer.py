"""
Visualizer Module
Purpose: Generate charts and visualizations from analyzed data
Features:
- Auto-generate charts based on data types
- Support for multiple chart types (bar, line, scatter, heatmap, etc.)
- Export to PNG, SVG, and interactive HTML
@version 1.0
@package data-analytics-agent
@author iamtensaiii
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
from typing import Dict, List, Optional, Any
from pathlib import Path
import warnings

warnings.filterwarnings('ignore')

# Set style
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (12, 6)


class DataVisualizer:
    """
    DataVisualizer
    Purpose: Create visualizations from dataframe
    @property DataFrame df: Input dataframe
    @property str output_dir: Directory to save charts
    """
    
    def __init__(self, df: pd.DataFrame, output_dir: str = "./output"):
        """
        Initialize Data Visualizer
        @param DataFrame df: Input dataframe
        @param str output_dir: Directory to save visualizations
        """
        self.df = df
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.charts_created = []
    
    def create_distribution_plot(self, column: str, chart_type: str = 'auto') -> str:
        """
        Create distribution plot for a column
        @param str column: Column name to visualize
        @param str chart_type: Type of chart ('auto', 'histogram', 'boxplot', 'violin')
        @return str: Path to saved chart
        @throws ValueError: When column doesn't exist
        """
        try:
            if column not in self.df.columns:
                raise ValueError(f"Column '{column}' not found")
            
            col_data = self.df[column].dropna()
            
            # Auto-detect chart type
            if chart_type == 'auto':
                if pd.api.types.is_numeric_dtype(col_data):
                    chart_type = 'histogram'
                else:
                    chart_type = 'bar'
            
            fig, ax = plt.subplots(figsize=(12, 6))
            
            if chart_type == 'histogram':
                ax.hist(col_data, bins=30, edgecolor='black', alpha=0.7)
                ax.set_title(f'Distribution of {column}', fontsize=14, fontweight='bold')
                ax.set_xlabel(column)
                ax.set_ylabel('Frequency')
            
            elif chart_type == 'boxplot':
                ax.boxplot(col_data)
                ax.set_title(f'Box Plot of {column}', fontsize=14, fontweight='bold')
                ax.set_ylabel(column)
            
            elif chart_type == 'violin':
                parts = ax.violinplot([col_data], showmeans=True, showmedians=True)
                ax.set_title(f'Violin Plot of {column}', fontsize=14, fontweight='bold')
                ax.set_ylabel(column)
            
            elif chart_type == 'bar':
                value_counts = col_data.value_counts().head(20)
                ax.bar(range(len(value_counts)), value_counts.values)
                ax.set_xticks(range(len(value_counts)))
                ax.set_xticklabels(value_counts.index, rotation=45, ha='right')
                ax.set_title(f'Top Values in {column}', fontsize=14, fontweight='bold')
                ax.set_ylabel('Count')
            
            plt.tight_layout()
            
            # Save chart
            output_path = self.output_dir / f"{column}_distribution.png"
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            plt.close()
            
            self.charts_created.append(str(output_path))
            return str(output_path)
            
        except Exception as e:
            raise Exception(f"Error creating distribution plot: {str(e)}")
    
    def create_correlation_heatmap(self, method: str = 'pearson') -> str:
        """
        Create correlation heatmap for numeric columns
        @param str method: Correlation method
        @return str: Path to saved heatmap
        @throws Exception: When no numeric columns exist
        """
        try:
            numeric_df = self.df.select_dtypes(include=[np.number])
            
            if numeric_df.empty:
                raise Exception("No numeric columns for correlation heatmap")
            
            corr_matrix = numeric_df.corr(method=method)
            
            fig, ax = plt.subplots(figsize=(14, 10))
            sns.heatmap(
                corr_matrix,
                annot=True,
                fmt='.2f',
                cmap='coolwarm',
                center=0,
                square=True,
                linewidths=1,
                cbar_kws={"shrink": 0.8}
            )
            ax.set_title('Correlation Heatmap', fontsize=16, fontweight='bold', pad=20)
            
            plt.tight_layout()
            
            output_path = self.output_dir / "correlation_heatmap.png"
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            plt.close()
            
            self.charts_created.append(str(output_path))
            return str(output_path)
            
        except Exception as e:
            raise Exception(f"Error creating correlation heatmap: {str(e)}")
    
    def create_scatter_plot(self, x_col: str, y_col: str, hue_col: Optional[str] = None) -> str:
        """
        Create scatter plot between two columns
        @param str x_col: X-axis column
        @param str y_col: Y-axis column
        @param str hue_col: Optional column for color coding
        @return str: Path to saved scatter plot
        """
        try:
            if x_col not in self.df.columns or y_col not in self.df.columns:
                raise ValueError("One or both columns not found")
            
            fig, ax = plt.subplots(figsize=(12, 8))
            
            if hue_col and hue_col in self.df.columns:
                for category in self.df[hue_col].unique():
                    mask = self.df[hue_col] == category
                    ax.scatter(
                        self.df.loc[mask, x_col],
                        self.df.loc[mask, y_col],
                        label=category,
                        alpha=0.6
                    )
                ax.legend()
            else:
                ax.scatter(self.df[x_col], self.df[y_col], alpha=0.6)
            
            ax.set_xlabel(x_col, fontsize=12)
            ax.set_ylabel(y_col, fontsize=12)
            ax.set_title(f'Scatter Plot: {x_col} vs {y_col}', fontsize=14, fontweight='bold')
            ax.grid(True, alpha=0.3)
            
            plt.tight_layout()
            
            output_path = self.output_dir / f"scatter_{x_col}_vs_{y_col}.png"
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            plt.close()
            
            self.charts_created.append(str(output_path))
            return str(output_path)
            
        except Exception as e:
            raise Exception(f"Error creating scatter plot: {str(e)}")
    
    def create_time_series_plot(self, date_col: str, value_col: str) -> str:
        """
        Create time series line plot
        @param str date_col: Date column
        @param str value_col: Value column
        @return str: Path to saved plot
        """
        try:
            if date_col not in self.df.columns or value_col not in self.df.columns:
                raise ValueError("One or both columns not found")
            
            # Ensure date column is datetime
            df_temp = self.df.copy()
            df_temp[date_col] = pd.to_datetime(df_temp[date_col])
            df_temp = df_temp.sort_values(date_col)
            
            fig, ax = plt.subplots(figsize=(14, 6))
            ax.plot(df_temp[date_col], df_temp[value_col], linewidth=2, marker='o', markersize=4)
            ax.set_xlabel(date_col, fontsize=12)
            ax.set_ylabel(value_col, fontsize=12)
            ax.set_title(f'Time Series: {value_col} over {date_col}', fontsize=14, fontweight='bold')
            ax.grid(True, alpha=0.3)
            plt.xticks(rotation=45, ha='right')
            
            plt.tight_layout()
            
            output_path = self.output_dir / f"timeseries_{value_col}.png"
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            plt.close()
            
            self.charts_created.append(str(output_path))
            return str(output_path)
            
        except Exception as e:
            raise Exception(f"Error creating time series plot: {str(e)}")
    
    def create_interactive_plot(self, chart_type: str, **kwargs) -> str:
        """
        Create interactive Plotly chart
        @param str chart_type: Type of chart ('scatter', 'line', 'bar', 'box')
        @param kwargs: Chart-specific parameters
        @return str: Path to saved HTML file
        """
        try:
            if chart_type == 'scatter':
                fig = px.scatter(
                    self.df,
                    x=kwargs.get('x'),
                    y=kwargs.get('y'),
                    color=kwargs.get('color'),
                    title=kwargs.get('title', 'Interactive Scatter Plot')
                )
            
            elif chart_type == 'line':
                fig = px.line(
                    self.df,
                    x=kwargs.get('x'),
                    y=kwargs.get('y'),
                    color=kwargs.get('color'),
                    title=kwargs.get('title', 'Interactive Line Chart')
                )
            
            elif chart_type == 'bar':
                fig = px.bar(
                    self.df,
                    x=kwargs.get('x'),
                    y=kwargs.get('y'),
                    color=kwargs.get('color'),
                    title=kwargs.get('title', 'Interactive Bar Chart')
                )
            
            elif chart_type == 'box':
                fig = px.box(
                    self.df,
                    x=kwargs.get('x'),
                    y=kwargs.get('y'),
                    color=kwargs.get('color'),
                    title=kwargs.get('title', 'Interactive Box Plot')
                )
            
            else:
                raise ValueError(f"Unknown chart type: {chart_type}")
            
            # Customize layout
            fig.update_layout(
                template='plotly_white',
                hovermode='closest'
            )
            
            output_path = self.output_dir / f"interactive_{chart_type}.html"
            fig.write_html(str(output_path))
            
            self.charts_created.append(str(output_path))
            return str(output_path)
            
        except Exception as e:
            raise Exception(f"Error creating interactive plot: {str(e)}")
    
    def auto_visualize(self, max_charts: int = 10) -> List[str]:
        """
        Automatically create relevant visualizations based on data types
        @param int max_charts: Maximum number of charts to create
        @return list: List of paths to created charts
        """
        try:
            charts = []
            chart_count = 0
            
            # 1. Create correlation heatmap if numeric columns exist
            numeric_cols = self.df.select_dtypes(include=[np.number]).columns.tolist()
            if len(numeric_cols) > 1 and chart_count < max_charts:
                try:
                    charts.append(self.create_correlation_heatmap())
                    chart_count += 1
                except:
                    pass
            
            # 2. Create distributions for first few numeric columns
            for col in numeric_cols[:3]:
                if chart_count >= max_charts:
                    break
                try:
                    charts.append(self.create_distribution_plot(col, 'histogram'))
                    chart_count += 1
                except:
                    pass
            
            # 3. Create bar charts for categorical columns
            categorical_cols = self.df.select_dtypes(include=['object']).columns.tolist()
            for col in categorical_cols[:2]:
                if chart_count >= max_charts:
                    break
                if self.df[col].nunique() < 50:  # Only if not too many categories
                    try:
                        charts.append(self.create_distribution_plot(col, 'bar'))
                        chart_count += 1
                    except:
                        pass
            
            # 4. Create scatter plots for top correlated pairs
            if len(numeric_cols) >= 2 and chart_count < max_charts:
                try:
                    corr_matrix = self.df[numeric_cols].corr()
                    # Find top correlation pair
                    correlations = []
                    for i in range(len(corr_matrix.columns)):
                        for j in range(i+1, len(corr_matrix.columns)):
                            correlations.append({
                                'col1': corr_matrix.columns[i],
                                'col2': corr_matrix.columns[j],
                                'corr': abs(corr_matrix.iloc[i, j])
                            })
                    
                    if correlations:
                        top_pair = max(correlations, key=lambda x: x['corr'])
                        charts.append(
                            self.create_scatter_plot(top_pair['col1'], top_pair['col2'])
                        )
                        chart_count += 1
                except:
                    pass
            
            self.charts_created = charts
            return charts
            
        except Exception as e:
            raise Exception(f"Error in auto visualization: {str(e)}")
    
    def get_charts_summary(self) -> Dict[str, Any]:
        """
        Get summary of all created charts
        @return dict: Summary of charts
        """
        return {
            'total_charts': len(self.charts_created),
            'output_directory': str(self.output_dir),
            'chart_paths': self.charts_created
        }

