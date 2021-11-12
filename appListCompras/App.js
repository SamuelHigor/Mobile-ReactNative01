import React ,{ useEffect, useState }from 'react';
import { Text, View, StatusBar, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { styles } from './style'
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const db = SQLite.openDatabase('compras.db')

const App = () => {
  const [produto, setProduto] = useState('')
  const [qtdd, setQtdd] = useState('')
  const [produtos, setProdutos] = useState([])

  const createTables = () => {
    db.transaction(txn => {
      txn.executeSql(
        `CREATE TABLE IF NOT EXISTS listaCompra (id INTEGER PRIMARY KEY AUTOINCREMENT,
           produto VARCHAR(20), qtdd INTEGER)`,
           [],
           (sqlTxn, res) => {
             console.log('Tabela criada com sucesso!');
           },
           error =>{
             console.log('Erro ao criar tabela' + error.message);
           },
      );
    });
  };

  const incluirProduto = () => {
    if(!qtdd)  {
      alert(' Informe uma quantidade');
      return false;
    } else if (!produto){
      alert('Informe um produto')
      return false
    }

    db.transaction( txn => {
      txn.executeSql(
        `INSERT INTO listaCompra (produto, qtdd) VALUES (?, ?)`,
        [produto, qtdd],
        (sqlTnx, res) => {
          console.log(`Produto ${produto}  foi adicionado com a quantidade de ${qtdd} com sucesso`)
          getProdutos();
          setProduto('');
          setQtdd('')
        },
        error => {
          console.log('Error ao inserir produto ' + error.message)
        }
      );
    });
  };

  const getProdutos = () => {
    db.transaction( txn => {
      txn.executeSql(
        `SELECT produto, qtdd FROM listaCompra ORDER BY id ASC`,
        [],
        (sqlTnx, res) => {
          console.log('Produtos listados com sucesso!');
          let len = res.rows.length;

          if (len > 0) {
            let results = [];
            for (let i = 0; i < len; i++){
              let item = res.rows.item(i);
              results.push({ id: item.id, produto: item.produto, qtdd: item.qtdd});
            }

            setProdutos(results);
          }
        },

        error => {
          console.log('Erro ao listar Produtos' + error.message)
        },
      );
    });
  };



  const renderProdutos = ({ item }) => {
    return(
      <View style={styles.conteudoLista}>
        <Text style={styles.textLista}>{item.produto}</Text>
        <Text style={styles.textLista}>({item.qtdd}) </Text>
      </View>
    );
  };

  useEffect(async () => {
    await createTables();
    await getProdutos();
  }, [1]);

  return(
    <View style={styles.container}>
      <StatusBar backgroundColor='yellow' />

      {/*HEADER*/}
      <View style={styles.header}>
        <Text style={styles.textHeader}>Lista de Compras</Text>
      </View>

      {/*INPUTS AND BUTTON*/}
      <View style={styles.areaCreate}>
        <TextInput
        keyboardType='numeric'
        style={styles.inptQtdd}
        placeholder='Qtdd'
        value={qtdd}
        onChangeText={setQtdd}
        />

        <TextInput
        style={styles.inptProd}
        placeholder='Informe o Produto'
        value={produto}
        onChangeText={setProduto}/>

        <TouchableOpacity
        style={styles.btnAdd}
        onPress={incluirProduto}>
          <FontAwesome name='cart-arrow-down' size={25} color='#556B2F' />
        </TouchableOpacity>
      </View>

      <View style={styles.areaTitle}>
        <Text style={styles.titleList}>Produto</Text>
        <Text style={styles.titleList}>Qtdd</Text>
      </View>

      <FlatList
      style={styles.listaProd}
      data={qtdd, produtos}
      renderItem={renderProdutos}
      key={t => t.id} />
    </View>
  )
}

export default App;