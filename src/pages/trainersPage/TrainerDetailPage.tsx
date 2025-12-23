import { useParams } from 'react-router-dom';

export default function TrainerDetailPage() {
  const { id } = useParams();
  return <div>Trainers Detail: {id}</div>;
}
