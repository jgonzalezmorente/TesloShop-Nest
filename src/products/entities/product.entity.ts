import { BeforeInsert, BeforeUpdate, Column, Entity, LegacyOracleNamingStrategy, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ProductImage } from './';
import { User } from '../../auth/entities/user.entity';

@Entity({ name: 'products' })
export class Product {

    @ApiProperty({
        example: '41829356-cac6-47e8-93db-23b5fbaa880b',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn( 'uuid' )
    id: string;
    
    @ApiProperty({
        example: 'T-Shirt Teslo',
        description: 'Product Title',
        uniqueItems: true
    })
    @ApiProperty()
    @Column( 'text', {
        unique: true,
    })
    title: string;
    
    @ApiProperty({
        example: 0,
        description: 'Product price'
    })
    @Column( 'float', {
        default: 0
    })
    price: number;
    
    @ApiProperty({
        example: 'Ipsum et id labore Lorem sint. Sit deserunt elit minim labore veniam.',
        description: 'Product price',
        default: null
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;
    
    @ApiProperty({
        example: 't_shirt_teslo',
        description: 'Product SLUG - for SEO',
        uniqueItems: true
    })
    @Column( 'text', {
        unique: true
    })
    slug: string;
    
    @ApiProperty({
        example: 10,
        description: 'Product stock',
        default: 0
    })
    @ApiProperty()
    @Column( 'int', {
        default: 0
    })
    stock: number;
    
    @ApiProperty({
        example: ['M', 'XL', 'XXL'],
        description: 'Product sizes',
        default: []   
    })
    @ApiProperty()
    @Column( 'text', {
        array: true
    })
    sizes: string[];

    @ApiProperty({
        example: 'women',
        description: 'Product gender'
    })
    @Column( 'text' )
    gender: string;

    @ApiProperty({
        example: ['shirt'],
        description: 'Product tags',
        default: []
    })
    @Column( 'text', {
        array: true,
        default: []
    })
    tags: string[];

    @ApiProperty({
        example: ['http://image1.jpg', 'http://image2.jpg'],
        description: 'Images',        
    })
    @OneToMany(
        () => ProductImage,
        ( productImage ) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[];

    @ManyToOne(
        () => User,
        ( user ) => user.product,
        { eager: true } //! Carga automáticamente relaciones asociadas a una entidad al hacer la consulta
    )
    user: User

    @BeforeInsert()
    @BeforeUpdate()
    checkSlugInsert() {
        if ( !this.slug ) {
            this.slug = this.title;
        }
        this.slug = this.slug
            .toLocaleLowerCase()
            .replaceAll( ' ', '_' )
            .replaceAll( "'", '' );
    }
}
