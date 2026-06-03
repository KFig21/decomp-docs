/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../contexts/dataContext';
import ItemDetailPage from './ItemDetailPage';
import ItemSidebar from './components/itemSidebar/ItemSidebar';
import './styles.scss';

export default function ItemsPage() {
  const { items } = useData();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [searchTerm, setSearchTerm] = useState('');

  const itemsArray = (Array.isArray(items) ? items : Object.values(items || {})) as any[];

  const filteredItems = useMemo(() => {
    return itemsArray.filter((item) => {
      if (item.name === '??????????' || item.key === 'ITEM_NONE') return false;
      if (searchTerm && !item.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [itemsArray, searchTerm]);

  useEffect(() => {
    if (!id && filteredItems.length > 0) {
      navigate(`/items/${filteredItems[0].key}`, { replace: true });
    }
  }, [id, filteredItems, navigate]);

  return (
    <div className="items-page">
      <div className="items-filter-bar">
        <input
          className="items-search-input"
          type="text"
          placeholder="Search items by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="items-page-content">
        <ItemSidebar filteredItems={filteredItems} activeId={id} />

        <div className="items-detail-area">
          {id ? (
            <ItemDetailPage />
          ) : (
            <div className="empty-selection">
              <h2>Select an Item</h2>
              <p>Click an item in the list to view its details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
