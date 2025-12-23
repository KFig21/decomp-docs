import { useParams } from 'react-router-dom';

export default function ItemDetailPage() {
  const { id } = useParams();
  return <div>Item Detail: {id}</div>;
}
