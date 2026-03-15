import axios from 'axios';

const XSMB_URL = 'https://raw.githubusercontent.com/khiemdoan/vietnam-lottery-xsmb-analysis/refs/heads/main/data/xsmb.json';

export const getLotteryResults = async (targetDate = null) => {
  try {
    const response = await axios.get(XSMB_URL);
    const data = response.data;
    
    let resultNode;
    if (targetDate) {
      // Find exact match for date (ignoring time)
      resultNode = data.find(item => item.date.startsWith(targetDate));
    } else {
      // Default to latest
      resultNode = data[data.length - 1];
    }

    if (!resultNode) return null;
    
    return [
      {
        id: 'mb',
        province: 'Miền Bắc',
        special: resultNode.special.toString().padStart(5, '0'),
        date: formatDate(resultNode.date)
      }
    ];
    
    return results;
  } catch (error) {
    console.error('Error fetching lottery results:', error);
    // Fallback data if API fails
    return [
      { id: 'mb', province: 'Miền Bắc', special: '-----', date: 'Đang cập nhật' }
    ];
  }
};

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
};

const getTodayDate = () => {
  const date = new Date();
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
};

const generateRandomSpecial = () => {
  return Math.floor(Math.random() * 100000).toString().padStart(5, '0');
};
