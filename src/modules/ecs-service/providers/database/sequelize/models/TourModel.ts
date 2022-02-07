import { Column, Model, Table } from 'sequelize-typescript';
import { Tour } from '../../../../models/Tour';

@Table({ tableName: 'tours' })
export default class TourModel extends Model implements Tour {
  @Column
    name!: string;

  @Column
    date!: Date;

  toEntity = () => {
    const example : Tour = {
      name: this.name,
    };
    return example;
  };
}
